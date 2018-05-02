import re
from datetime import date, datetime, timedelta

import dateutil.parser
from sqlalchemy import and_
from sqlalchemy.orm import load_only
from validate_email import validate_email as is_email_valid

from app import db
from app.main import bp
from app.main.forms import OrderForm
from flask import render_template, flash, redirect, url_for, jsonify, request, Response
from flask_babel import _
from flask_login import login_required, current_user
from app.models import House, Order, HouseCategory, Client, ClientCategory, HousePrice
from app.main.email import send_book_confirmation_email


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


def date_range(from_date, to_date):
    current_date = from_date
    while current_date <= to_date:
        yield current_date
        current_date += timedelta(days=1)


def parse_date_range(str_date_range):
    from_date = dateutil.parser.parse(str_date_range[0])
    to_date = dateutil.parser.parse(str_date_range[1])
    print("from", from_date, "to", to_date)
    return from_date, to_date


@bp.route('/api/edit/prices', methods=['POST'])
def generate_prices():
    print("Generate prices called")
    content = request.json

    for price_policy in ('weekday', 'weekend', 'holiday'):
        for str_date_range in content[price_policy]['dates']:
            for date in date_range(*parse_date_range(str_date_range)):
                for key, price in content[price_policy]['prices'].items():
                    client_category_id, house_category_id = (int(elem) for elem in key.split('_'))
                    client_category = ClientCategory(client_category_id).name
                    house_price = HousePrice(date=date, client_category=client_category,
                                             house_category_id=house_category_id, price=price)
                    db.session.merge(house_price)
                    db.session.commit()

    return Response()


@bp.route('/api/edit/add_house', methods=['POST'])
def add_house():
    content = request.json
    try:
        name = validate_text_non_empty(content['name'])
        category = validate_house_category_id(int(content['categoryId']))
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    description = content.get('text', '')
    image_url = content.get('image_url', '')
    db.session.add(House(name=name, house_category=category, description=description, image_url=image_url))
    db.session.commit()
    return Response()


@bp.route('/api/edit/add_house_category', methods=['POST'])
def add_house_category():
    content = request.json
    try:
        name = validate_text_non_empty(content['name'])
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    description = content.get('text', '')
    db.session.add(HouseCategory(name=name, description=description))
    db.session.commit()
    return Response()


def validate_house_category_id(id):
    house_category = HouseCategory.query.filter_by(house_category_id=id).first()
    if house_category is None:
        raise ValueError(f'House category with specified id={id} does not exist')
    else:
        return house_category


def validate_house_id(id):
    house = House.query.filter_by(house_id=id).first()
    if house is None:
        raise ValueError(f'House with specified id={id} does not exist')
    else:
        return house


def validate_date(date):
    if date < datetime.today().date():
        raise ValueError(f'Check in date {date} is earlier than today')
    else:
        return date


def validate_date_earlier(from_date, to_date):
    if from_date >= to_date:
        raise ValueError('Check in date must be earlier than check out date')


def validate_text_non_empty(text):
    if not text:
        raise ValueError('Required field is empty')
    return text


def validate_email(email):
    if not is_email_valid(email):
        raise ValueError(f'Invalid e-mail {email}')
    return email


phone_regex = re.compile(r'^((\+7)|8)\d{10}$')


def validate_phone(phone):
    if phone_regex.match(phone) is None:
        raise ValueError(f'Phone {phone} does not match')
    return phone


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


# @bp.route('/api/book', methods=['OPTION'])
# def catch_all(path):
#     response = Response()
#     response.headers['Access-Control-Allow-Origin'] = '*'
#     response.headers['Access-Control-Allow-Methods'] = '*'
#     response.headers['Access-Control-Allow-Headers'] = '*'
#     return response


@bp.route('/index')
@login_required
def index():
    return render_template('index.html', title=_('Recreation Centers'))


@bp.route('/order', methods=['POST', 'GET'])
@login_required
def order():
    form = OrderForm()
    # form.check_in.data = datetime.date.today()
    # form.check_out.data = datetime.date.today() + datetime.timedelta(days=1)
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
