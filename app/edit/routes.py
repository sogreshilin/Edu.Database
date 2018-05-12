import uuid
from datetime import timedelta

import dateutil.parser
import os
from flask import request, Response, render_template, jsonify

from app import db
from app.edit import bp
from app.main.validators import *
from app.models import ClientCategory, HousePrice
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
    from_date = dateutil.parser.parse(str_date_range[0])
    to_date = dateutil.parser.parse(str_date_range[1])
    return from_date, to_date


@bp.route('/api/edit/prices', methods=['POST'])
def generate_prices():
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
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    description = content.get('text', '')
    db.session.add(HouseCategory(name=name, description=description))
    db.session.commit()
    return Response()


@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')
