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
    holiday = Holiday(date=date)
    db.session.merge(holiday)
    db.session.commit()
    return get_holidays()


@bp.route('/api/remove/holiday', methods=['POST'])
def remove_holiday():
    date = request.json['date']
    date = dateutil.parser.parse(date).astimezone(tzlocal()).replace(hour=0, minute=0, second=0, microsecond=0)
    holiday = Holiday.query.filter(Holiday.date == date).first()
    db.session.delete(holiday)
    db.session.commit()
    return get_holidays()


