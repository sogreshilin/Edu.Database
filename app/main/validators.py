import re

from _datetime import datetime
from app.models import HouseCategory, House, ClientCategory
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