from datetime import date

from sqlalchemy import and_, func

from app import db
from app.main import bp
from app.main.forms import OrderForm
from flask import render_template, flash, redirect, url_for, jsonify, request, Response
from flask_babel import _
from flask_login import login_required, current_user

from app.main.validators import *
from app.models import House, Order, HouseCategory, Client, ClientCategory, HousePrice
from app.main.email import send_book_confirmation_email


# list can be passed
def validate_price_request(req):
    house_category_id = request.args.get('house')
    from_date = date.fromtimestamp(int(request.args.get('from')))
    to_date = date.fromtimestamp(int(request.args.get('to')))
    client_category_id = int(request.args.get('client'))
    if client_category_id is None:
        client_category_id = ClientCategory.NON_COMPANY_WORKER

    validate_client_category_id(client_category_id)
    validate_house_category_id(house_category_id)
    validate_date(from_date)
    validate_date(to_date)
    validate_date_earlier(from_date, to_date)

    return house_category_id, client_category_id, from_date, to_date


def query_house_and_apply(fun):
    try:
        house_category_id, client_category_id, from_date, to_date = validate_price_request(request)

    except ValueError as error:
        return Response(str(error), status=400)

    condition = ((from_date <= HousePrice.date) & (HousePrice.date <= to_date) &
                 (HousePrice.house_category_id == house_category_id) &
                 (HousePrice.client_category == ClientCategory(client_category_id)))

    return db.session.query(fun(HousePrice.price)).filter(condition).first()


@bp.route('/api/house/min_price')
def get_min_house_price():
    return jsonify({"min_price": query_house_and_apply(func.min)})


@bp.route('/api/house/total_cost')
def get_house_total_cost():
    return jsonify({"total_cost": query_house_and_apply(func.sum)})


@bp.route('/api/houses')
def get_houses():
    print("houses api called")

    houses = House.query.all()
    categories = HouseCategory.query.all()

    response = {
        "houses": {
            house.house_id : {
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
    print(content)
    try:
        from_date = validate_date(date.fromtimestamp(int(content['from_date'])))
        to_date = validate_date(date.fromtimestamp(int(content['to_date'])))
        validate_date_earlier(from_date, to_date)
    except ValueError as error:
        print(error)
        return Response(str(error), status=400)
    query = db.session.query(Order.house_id).filter(and_(Order.check_in_time.between(from_date, to_date),
                                        Order.check_out_time.between(from_date, to_date)))
    subquery = db.session.query(House.house_id)
    free_houses = list(map(lambda elem: elem[0], subquery.filter(~House.house_id.in_(query)).all()))
    print('response_content:', free_houses)
    return jsonify({"houses": free_houses})


@bp.route('/api/book', methods=['POST'])
def api_book():
    content = request.json
    print(content)
    try:
        house = validate_house_id(int(content['house_id']))
        from_date = validate_date(date.fromtimestamp(int(content['from_date'])))
        to_date = validate_date(date.fromtimestamp(int(content['to_date'])))
        validate_date_earlier(from_date, to_date)
        client_category = ClientCategory.COMPANY_WORKER \
            if content['is_company_worker'] == 'True' \
            else ClientCategory.NON_COMPANY_WORKER
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

    order = Order(client=client, house=house, check_in_time=from_date, check_out_time=to_date)
    db.session.add(order)
    db.session.commit()

    # send_book_confirmation_email(client, order)
    return Response()


@bp.route('/index')
@login_required
def index():
    return render_template('index.html', title=_('Recreation Centers'))


@bp.route('/order', methods=['POST', 'GET'])
@login_required
def order():
    form = OrderForm()
    form.house_category.choices = [(category.house_category_id, category.name)
                                   for category in HouseCategory.query.order_by('name')]
    form.house.choices = [(house.house_id, house.name) for house in House.query.order_by('name')]
    if form.validate_on_submit():
        house = House.query.filter_by(house_id=form.house.data).first()
        client = current_user
        order = Order(status_id=1, client_id=client.client_id, house_id=house.house_id,
            check_in_time=form.check_in.data, check_out_time=form.check_out.data)
        db.session.add(order)
        db.session.commit()
        flash(_('House successfully ordered'))
        return redirect(url_for('main.index'))
    return render_template('main/order.html', title='Book house', form=form)


@bp.route('/profile/orders')
@login_required
def orders():
    return render_template('main/client_orders.html', client=current_user)
