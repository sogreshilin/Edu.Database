import re

from _datetime import datetime

import pytz
from dateutil.tz import tzlocal

from app.models import HouseCategory, House, ClientCategory, Client, Order, Service
from validate_email import validate_email as is_email_valid


def validate_client_category_id(client_category_id):
    _ = ClientCategory(client_category_id)



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


def validate_service_id(id):
    service = Service.query.filter_by(service_id=id).first()
    if service is None:
        raise ValueError(f'Service with specified id={id} does not exist')
    else:
        return service


def validate_date(date: datetime):
    if date < datetime.now(tz=date.tzinfo):
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


phone_regex = re.compile(r'^7\d{10}$')


def validate_phone(phone):
    if phone_regex.match(phone) is None:
        raise ValueError(f'Phone {phone} does not match')
    return phone


def validate_client_id(id):
    client = Client.query.filter_by(client_id=id).first()
    if client is None:
        raise ValueError(f'Client with specified id={id} does not exist')
    else:
        return client


def validate_order_id(id):
    order = Order.query.filter_by(order_id=id).first()
    if order is None:
        raise ValueError(f'Order with specified id={id} does not exist')
    else:
        return order
