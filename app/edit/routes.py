import uuid
from datetime import timedelta

import dateutil.parser
import os
from flask import request, Response, render_template, jsonify

from app import db
from app.edit import bp
from app.main.routes import get_services, get_houses
from app.main.validators import *
from app.models import ClientCategory, Service, ServicePrice, HouseRental, DateType, Holiday
from config import IMAGE_DIR


@bp.context_processor
def inject_now():
    return dict(now=datetime.utcnow())


@bp.route('/api/upload/image', methods=['POST'])
def upload_image():
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


@bp.route('/api/holidays')
def get_holidays():
    return jsonify({'holidays': [holiday.date.isoformat() for holiday in Holiday.query.all()]})


@bp.route('/api/add/holiday', methods=['POST'])
def add_holiday():
    date = request.json['date']
    date = dateutil.parser.parse(date).astimezone(tzlocal()).replace(hour=0, minute=0, second=0, microsecond=0)
    db.session.add(Holiday(date=date))
    db.session.commit()
    return get_holidays()


@bp.route('/api/edit/house', methods=['POST'])
def edit_house():
    # todo: add images handling
    content = request.form
    try:
        name = validate_text_non_empty(content['name'])
        house = validate_house_id(content['house_id'])
        description = content.get('description', '')
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)

    house.name = name
    house.description = description
    db.session.commit()
    return get_houses()


@bp.route('/api/add/house', methods=['POST'])
def add_house():
    # todo: add images handling
    name = request.form.get('name', None)
    description = request.form.get('description', '')

    if name is None:
        return Response('House name cannot be empty', status=400)
    try:
        category = validate_house_category_id(request.form['category_id'])
    except ValueError as error:
        return Response(str(error), status=400)

    house = House(name=name, description=description, house_category=category)
    db.session.add(house)
    db.session.commit()

    return get_houses()
