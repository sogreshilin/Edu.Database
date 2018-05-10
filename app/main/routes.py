from datetime import date, datetime

from dateutil.tz import tzlocal
from sqlalchemy import and_, func, or_

from app import db
from app.main import bp
from app.main.forms import OrderForm
from flask import render_template, flash, redirect, url_for, jsonify, request, Response
from flask_babel import _
from flask_login import login_required, current_user

from app.main.validators import *
from app.models import House, Order, HouseCategory, Client, ClientCategory, HousePrice, OrderStatus
from app.main.email import send_book_confirmation_email


def get_house_total_cost(house_category_id, client_category, from_date, to_date):
    print('get_house_total_cost(', house_category_id, ',', from_date, ',', to_date, ')')
    condition = ((from_date <= HousePrice.date) & (HousePrice.date <= to_date) &
                 (HousePrice.house_category_id == house_category_id) & (HousePrice.client_category == client_category))

    return db.session.query(func.sum(HousePrice.price)).filter(condition).first()[0]


@bp.route('/api/houses')
def get_houses():
    print("houses api called")

    houses = House.query.all()
    categories = HouseCategory.query.all()

    response = {
        "houses": {
            house.house_id: {
                "id": house.house_id,
                "name": house.name,
                "description": house.description,
                "category": house.house_category_id,
                "image": house.image_url
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
    print('response content:', response)
    return jsonify(response)


@bp.route('/api/client_categories')
def get_client_categories():
    print("get_clients_categories api called")
    client_categories = list(ClientCategory)
    response = {
        category.value: {
            "id": category.value,
            "name": category.name,
            "prices": {}
        } for category in client_categories
    }
    print(response)
    return jsonify(response)


@bp.route('/api/free_houses', methods=['POST'])
def get_free_houses():
    content = request.json
    try:
        from_date = validate_date(datetime.fromtimestamp(int(content['from_date'])))
        to_date = validate_date(datetime.fromtimestamp(int(content['to_date'])))
        validate_date_earlier(from_date, to_date)
    except ValueError as error:
        print(error)
        return Response(str(error), status=400)
    occupied_house_ids = db.session.query(Order.house_id) \
        .filter(and_(Order.status != OrderStatus.CANCELED, or_(
            and_(from_date <= Order.check_in_time_expected, Order.check_in_time_expected <= to_date),
            and_(from_date <= Order.check_out_time_expected, Order.check_out_time_expected <= to_date))))
    free_houses = list(map(lambda elem: elem[0], db.session.query(House.house_id, House.house_category_id)
                           .filter(~House.house_id.in_(occupied_house_ids)).all()))
    house_and_category = db.session.query(House.house_id, House.house_category_id).filter(~House.house_id.in_(occupied_house_ids)).all()
    print(house_and_category)

    house_prices = dict()
    for house_id, house_category_id in house_and_category:
        prices = dict()
        for client_category in list(ClientCategory):
            prices[client_category.value] = get_house_total_cost(house_category_id, client_category, from_date, to_date)
        house_prices[house_id] = prices
    print(house_prices)

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


@bp.route('/api/book', methods=['POST'])
def api_book():
    content = request.json
    print(content)
    try:
        house = validate_house_id(int(content['house_id']))
        from_date = validate_date(datetime.fromtimestamp(int(content['from_date']), tzlocal()))
        to_date = validate_date(datetime.fromtimestamp(int(content['to_date']), tzlocal()))
        validate_date_earlier(from_date, to_date)
        client_category = ClientCategory.COMPANY_WORKER \
            if content['is_company_worker'] else ClientCategory.NON_COMPANY_WORKER
        last_name = validate_text_non_empty(content['last_name'])
        first_name = validate_text_non_empty(content['first_name'])
        middle_name = content['middle_name']
        email = validate_email(content['email'])
        phone = validate_phone(content['phone'])
    except ValueError as error:
        print(error)
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

    order = Order(client=client, house=house, check_in_time_expected=from_date, check_out_time_expected=to_date, status=OrderStatus.BOOKED)
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
