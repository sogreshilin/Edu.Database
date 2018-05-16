import uuid
from datetime import timedelta

import dateutil.parser
import os
from flask import request, Response, render_template, jsonify

from app import db
from app.edit import bp
from app.main.routes import get_services
from app.main.validators import *
from app.models import ClientCategory, Service, ServicePrice, HouseRental, DateType
from config import IMAGE_DIR


@bp.context_processor
def inject_now():
    return dict(now=datetime.utcnow())


def date_range(from_date, to_date):
    current_date = from_date
    while current_date <= to_date:
        yield current_date
        current_date += timedelta(days=1)


def parse_date_range(str_date_range):
    from_date = (dateutil.parser
                              .parse(str_date_range[0])
                              .astimezone(tzlocal())
                              .replace(hour=0, minute=0, second=0, microsecond=0))
    to_date = (dateutil.parser
                            .parse(str_date_range[1])
                            .astimezone(tzlocal())
                            .replace(hour=0, minute=0, second=0, microsecond=0))
    return from_date, to_date


# @bp.route('/api/edit/prices', methods=['POST'])
# def generate_prices():
#     content = request.json
#     for price_policy in ('weekday', 'weekend', 'holiday'):
#         for str_date_range in content[price_policy]['dates']:
#             for date in date_range(*parse_date_range(str_date_range)):
#                 for key, price in content[price_policy]['prices'].items():
#                     client_category_id, house_category_id = (int(elem) for elem in key.split('_'))
#                     client_category = ClientCategory(client_category_id).name
#                     price = Price(price=price)
#                     db.session.add(price)
#                     db.session.flush()
#                     print("Price id:", price.price_id)
#                     house_price = HousePrice(price_id=price.price_id, date=date, client_category=client_category,
#                                              house_category_id=house_category_id)
#                     print("HousePrice id:", house_price.price_id)
#                     db.session.merge(house_price)
#                     db.session.commit()
#
#     return Response()


@bp.route('/api/upload/house_image', methods=['POST'])
def upload_house_image():
    mime_type = request.headers['Content-Type']
    if mime_type.startswith('image/'):
        file_type = mime_type[6:]
        file_name = str(uuid.uuid4())

        if not os.path.exists(IMAGE_DIR):
            os.makedirs(IMAGE_DIR)

        with open(IMAGE_DIR + file_name + '.' + file_type, 'wb') as file:
            file.write(request.data)

        return jsonify({'filename': file_name + '.' + file_type})
    return Response(f'Image file expected, found: {mime_type}', status=400)


@bp.route('/api/edit/house', methods=['POST'])
def add_house():
    content = request.json
    try:
        name = validate_text_non_empty(content['name'])
        category = validate_house_category_id(int(content['category_id']))
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    description = content.get('description', '')
    image_filename = content.get('image_filename', '')
    print('image_filename:', image_filename)
    try:
        house = validate_house_id(content['house_id'])
        house.name = name
        house.house_category = category
        house.description = description
        house.image_url = image_filename
        db.session.commit()
    except ValueError as error:
        db.session.add(House(name=name, house_category=category, description=description))
        db.session.commit()
    return Response()


@bp.route('/api/edit/add_house_category', methods=['POST'])
def add_house_category():
    content = request.json
    try:
        name = validate_text_non_empty(content['name'])
        description = content.get('text', '')
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)

    house_category = HouseCategory(name=name, description=description)
    db.session.add(house_category)
    for date_type in DateType:
        for client_category in ClientCategory:
            service = Service(name=f'<{date_type.name}> <{client_category.name}> <{name}>')
            db.session.add(service)
            db.session.flush()
            house_rental = HouseRental(service_id=service.service_id,
                                       house_category_id=house_category.house_category_id,
                                       client_category=client_category,
                                       date_type=date_type)
            db.session.add(house_rental)
            service_price = ServicePrice(service_id=service.service_id)
            db.session.add(service_price)

    db.session.commit()
    return Response()


# @bp.route('/api/edit/add_service', methods=['POST'])
# def add_service():
#     content = request.json
#     print(content)
#     try:
#         name = validate_text_non_empty(content['name'])
#         price = int(content['price'])
#     except (ValueError, KeyError) as error:
#         return Response(str(error), status=400)
#     description = content.get('description', '')
#     price = Price(price=price)
#     service = Service(name=name, description=description)
#     db.session.add(service)
#     db.session.add(price)
#     db.session.flush()
#     service_price = ServicePrice(price_id=price.price_id, service_id=service.service_id)
#     db.session.add(service_price)
#     db.session.commit()
#     return get_services()


# @bp.route('/api/edit/edit_service', methods=['POST'])
# def edit_service():
#     content = request.json
#     try:
#         service = validate_service_id(content['id'])
#         name = validate_text_non_empty(content['name'])
#         price = int(content['price'])
#     except (ValueError, KeyError) as error:
#         return Response(str(error), status=400)
#     description = content.get('description', '')
#     service.name = name
#     service.description = description
#     service.price = price
#     db.session.commit()
#     return get_services()
#
#
# @bp.route('/api/edit/delete_service', methods=['POST'])
# def delete_service():
#     content = request.json
#     try:
#         service = validate_service_id(content['id'])
#     except (ValueError, KeyError) as error:
#         return Response(str(error), status=400)
#     db.session.delete(service)
#     db.session.commit()
#     return get_services()

