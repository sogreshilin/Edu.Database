from datetime import date, datetime, timedelta

import dateutil
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import load_only

from app import db
from app.main import bp
from flask import render_template, jsonify, request, Response, send_file
from flask_babel import _
from flask_login import login_required, current_user

from app.main.validators import *
from app.models import House, Order, HouseCategory, Client, ClientCategory, OrderStatus, Service, \
    OrderService, Payment, ServicePrice, HouseRental, Holiday, DateType
from app.main.email import send_book_confirmation_email
from config import IMAGE_DIR


@bp.context_processor
def inject_now():
    return dict(now=datetime.utcnow())


def date_range(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield start_date + timedelta(n)


def get_house_total_cost(house_category_id, client_category, from_date, to_date):
    print(from_date, to_date)
    return sum([HouseRental.query
               .filter(and_(HouseRental.client_category == client_category,
                       HouseRental.house_category_id == house_category_id,
                       HouseRental.date_type == DateType.get_date_type(date))
                       ).first().super_service.actual_price().value
               for date in date_range(from_date, to_date)])


@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')


@bp.route('/api/houses')
def get_houses():
    houses = House.query.all()
    categories = HouseCategory.query.all()

    response = {
        "houses": {
            house.house_id: {
                "id": house.house_id,
                "name": house.name,
                "category": house.house_category_id,
            } for house in houses
        },
        "categories": {
            category.house_category_id: {
                "id": category.house_category_id,
                "name": category.name
            } for category in categories
        },
        "links": {
            category.house_category_id: [house.house_id for house in category.houses]
            for category in categories
        }
    }
    return jsonify(response)


@bp.route('/api/client_categories')
def get_client_categories():
    client_categories = list(ClientCategory)
    response = {
        category.value: {
            "id": category.value,
            "name": category.name,
            "prices": {}
        } for category in client_categories
    }
    return jsonify(response)


@bp.route('/api/free_houses', methods=['POST'])
def get_free_houses():
    content = request.json
    try:
        from_date = validate_date(dateutil.parser
                                  .parse(content['from_date'])
                                  .astimezone(tzlocal())
                                  .replace(hour=0, minute=0, second=0, microsecond=0))
        to_date = validate_date(dateutil.parser
                                .parse(content['to_date'])
                                .astimezone(tzlocal())
                                .replace(hour=0, minute=0, second=0, microsecond=0))
        print('api/free_houses', from_date, to_date)
        validate_date_earlier(from_date, to_date)
    except ValueError as error:
        return Response(str(error), status=400)
    occupied_house_ids = db.session.query(Order.house_id) \
        .filter(and_(Order.status != OrderStatus.CANCELED, or_(
        and_(from_date <= Order.check_in_time_expected, Order.check_in_time_expected <= to_date),
        and_(from_date <= Order.check_out_time_expected, Order.check_out_time_expected <= to_date))))
    free_houses = list(map(lambda elem: elem[0], db.session.query(House.house_id, House.house_category_id)
                           .filter(~House.house_id.in_(occupied_house_ids)).all()))
    house_and_category = db.session.query(House.house_id, House.house_category_id).filter(
        ~House.house_id.in_(occupied_house_ids)).all()

    house_prices = dict()
    for house_id, house_category_id in house_and_category:
        prices = dict()
        for client_category in list(ClientCategory):
            prices[client_category.value] = get_house_total_cost(house_category_id, client_category, from_date, to_date)
        house_prices[house_id] = prices

    return jsonify({'houses': free_houses, 'prices': house_prices})


@bp.route('/api/current_user')
def api_current_user():
    if current_user.is_authenticated:
        response = {
            'is_authenticated': True,
            'id': current_user.client_id,
            'category_id': current_user.client_category.value,
            'last_name': current_user.last_name,
            'first_name': current_user.first_name,
            'middle_name': current_user.middle_name,
            'phone': current_user.phone_number,
            'email': current_user.email
        }
    else:
        response = {
            'is_authenticated': False
        }
    return jsonify(response)


@bp.route('/api/upcoming_orders')
def get_upcoming_orders():
    orders = {order.order_id: order.to_json() for order in Order.query.all()}
    return jsonify(orders)


@bp.route('/api/payment', methods=['POST'])
def add_payment():
    # todo: check that current_user is administrator
    print(request.json)
    try:
        order = validate_order_id(int(request.json['order_id']))
        order_services = validate_order_service_ids(order, request.json['service_ids'])
        print('all order services:', order.services)
        print('filtered:')
        total = 0
        payment = Payment(order_id=order.order_id, total=sum(map(
            lambda order_service: order_service.amount * order_service.service.price, order_services)))
        db.session.add(payment)
        db.session.flush()
        for service in order_services:
            print(service.service.name)
            if service.is_payed:
                raise ValueError(f'Service "{service.service.name}" already payed')
            service.is_payed = True
            service.payment = payment
        db.session.commit()
    except (ValueError, TypeError) as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/order/add_services', methods=['POST'])
def add_services_to_order():
    print(request.json)
    try:
        order = validate_order_id(int(request.json['order_id']))
        for service in request.json['services']:
            print(service)
            order_service = OrderService(amount=service['amount'])
            order_service.service_id = service['service_id']
            order.services.append(order_service)
            db.session.add(order_service)
        db.session.commit()
    except (ValueError, TypeError) as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/services')
def get_services():
    services = {service.service_id: service.to_json() for service in Service.query.all()}
    return jsonify(services)


@bp.route('/api/reject_company_worker', methods=['POST'])
def reject_company_worker():
    # todo: check that current_user is administrator
    try:
        order = validate_order_id(int(request.json['order_id']))
        order.client_category_confirmed = False
        db.session.commit()
    # todo: add outstanding payment
    except ValueError as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/confirm_company_worker', methods=['POST'])
def confirm_company_worker():
    # todo: check that current_user is administrator
    try:
        order = validate_order_id(int(request.json['order_id']))
        order.client_category_confirmed = True
        db.session.commit()
    except ValueError as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/confirm_check_in', methods=['POST'])
def confirm_check_in():
    # todo: check that current_user is administrator
    try:
        order = validate_order_id(int(request.json['order_id']))
        order.check_in_time_actual = datetime.now(tzlocal())
        db.session.commit()
    except ValueError as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/confirm_check_out', methods=['POST'])
def confirm_check_out():
    # todo: check that current_user is administrator
    try:
        order = validate_order_id(int(request.json['order_id']))
        order.check_out_time_actual = datetime.now(tzlocal())
        db.session.commit()
    except ValueError as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/confirm_amount', methods=['POST'])
def confirm_people_count():
    # todo: check that current_user is administrator
    try:
        order = validate_order_id(int(request.json['order_id']))
        amount = int(request.json['amount'])
        order.person_count = amount
        db.session.commit()
    except ValueError as error:
        return Response(str(error), status=400)
    return jsonify(order.to_json())


@bp.route('/api/book', methods=['POST'])
def api_book():
    content = request.json
    try:
        house = validate_house_id(int(content['house_id']))
        from_date = validate_date(dateutil.parser
                                  .parse(content['from_date'])
                                  .astimezone(tzlocal())
                                  .replace(hour=0, minute=0, second=0, microsecond=0))
        to_date = validate_date(dateutil.parser
                                .parse(content['to_date'])
                                .astimezone(tzlocal())
                                .replace(hour=0, minute=0, second=0, microsecond=0))
        validate_date_earlier(from_date, to_date)
        client_category = ClientCategory.COMPANY_WORKER \
            if content['is_company_worker'] else ClientCategory.NON_COMPANY_WORKER
        last_name = validate_text_non_empty(content['last_name'])
        first_name = validate_text_non_empty(content['first_name'])
        middle_name = content['middle_name']
        email = validate_email(content['email'])
        phone = validate_phone(content['phone'])

    except ValueError as error:
        return Response(str(error), status=400)

    client = Client.query.filter_by(email=email).first()
    if client is None:
        client = Client(client_category=client_category,
                        first_name=first_name,
                        last_name=last_name,
                        middle_name=middle_name,
                        phone_number=phone,
                        email=email)
        db.session.add(client)
        db.session.commit()

    order = Order(client=client, house=house, status=OrderStatus.BOOKED,
                  check_in_time_expected=from_date, check_out_time_expected=to_date)
    db.session.add(order)
    db.session.commit()

    # send_book_confirmation_email(client, order)
    return Response()


@bp.route('/index')
@login_required
def index():
    return render_template('index.html', title=_('Recreation Centers'))


@bp.route('/api/orders/<int:id>')
def order_review(id: int):
    if not isinstance(id, int) or id <= 0:
        return Response("<order id> must be a positive integer", status=400)

    order_info = Order.query.filter_by(order_id=id).first()

    if order_info is not None:
        return jsonify(order_info.to_json())
    else:
        return Response(status=404)


@bp.route('/api/orders/<int:order_id>/cancel', methods=['PATCH'])
def cancel_order(order_id: int):
    order_info = Order.query.filter_by(order_id=order_id).first()

    if order_info is not None:
        current_order_status = OrderStatus(order_info.status.value)
        print("Current order status:", current_order_status)
        response = Response(status=200)

        if current_order_status == OrderStatus.BOOKED:
            order_info.status = OrderStatus.CANCELED
            db.session.commit()
        elif current_order_status == OrderStatus.ACTIVE:
            response = Response("Active order cannot be cancelled", status=409)
        elif current_order_status == OrderStatus.CANCELED:
            response = Response("Order is already cancelled", status=409)
        elif current_order_status == OrderStatus.PAYED:
            response = Response(status=501)
        else:
            response = Response("Unsupported order status", status=500)

        return response
    else:
        return Response(status=404)


@bp.route('/resources/image/<filename>')
def get_image(filename):
    print("get", filename)
    extension = filename.split('.')[-1]
    return send_file("../resources/image/" + filename, mimetype=('image/' + extension))

