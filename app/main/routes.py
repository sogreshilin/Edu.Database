import re
from datetime import date, datetime

from sqlalchemy import and_
from sqlalchemy.orm import load_only
from validate_email import validate_email as is_email_valid

from app import db
from app.main import bp
from app.main.forms import OrderForm
from flask import render_template, flash, redirect, url_for, jsonify, request, Response
from flask_babel import _
from flask_login import login_required, current_user
from app.models import House, Order, HouseCategory, Client, ClientCategory
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


@bp.route('/api/free_houses', methods=['POST'])
def get_free_houses():
    content = request.json
    print(content)
    try:
        from_date = validate_date(date.fromtimestamp(int(content['from_date'])))
        to_date = validate_date(date.fromtimestamp(int(content['to_date'])))
        validate_date_earlier(from_date, to_date)
        # category = validate_house_category_id(int(content['category']))
        # house = validate_house_id(int(content['house']))
    except ValueError as error:
        print(error)
        return Response(str(error), status=400)
    query = db.session.query(Order.house_id).filter(and_(Order.check_in_time.between(from_date, to_date),
                                        Order.check_out_time.between(from_date, to_date)))
    subquery = db.session.query(House.house_id)
    free_houses = list(map(lambda elem: elem[0], subquery.filter(~House.house_id.in_(query)).all()))
    print('response_content:', free_houses)
    return jsonify({"houses": free_houses})


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


def validate_name(name):
    if not name:
        raise ValueError('Name is empty')
    return name


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
        last_name = validate_name(content['last_name'])
        first_name = validate_name(content['first_name'])
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
