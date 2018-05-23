import jwt
import enum

from dateutil.tz import tzlocal
from flask import current_app
from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from time import time
from datetime import datetime


@login.user_loader
def load_user(id):
    return Client.query.get(int(id))


class ClientCategory(enum.Enum):
    COMPANY_WORKER = 1
    NON_COMPANY_WORKER = 2


class Client(UserMixin, db.Model):
    __tablename__ = 'client'
    client_id = db.Column(db.Integer, primary_key=True)
    client_category = db.Column(db.Enum(ClientCategory))
    first_name = db.Column(db.String(128), index=True, nullable=False)
    last_name = db.Column(db.String(128), index=True, nullable=False)
    middle_name = db.Column(db.String(128), index=True)
    phone_number = db.Column(db.String(32), index=True)
    email = db.Column(db.String(128), index=True, nullable=False)
    password_hash = db.Column(db.String(128))
    orders = db.relationship('Order', backref='client')

    def get_id(client):
        return client.client_id

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_token(self, expires_in=600):
        return jwt.encode({'reset_password': self.client_id, 'exp': time() + expires_in},
                          current_app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])['reset_password']
        except:
            return
        return Client.query.get(id)

    def __repr__(self):
        return 'Client-{} client_category={}, name={} {} {}, phone={}, email={}'.format(self.client_id,
                                                                                        self.client_category,
                                                                                        self.last_name, self.first_name,
                                                                                        self.middle_name,
                                                                                        self.phone_number, self.email)


class OrderStatus(enum.Enum):
    BOOKED = 1
    PAYED = 2
    ACTIVE = 3
    CANCELED = 4


# class Extra(enum.Enum):
#     EXTRA_HOUR = 1
#     EXTRA_PERSON = 2
#
#
# house_category_object = db.Table('house_category_object', db.metadata,
#                                  db.Column('house_category_id', db.Integer,
#                                            db.ForeignKey('house_category.house_category_id')),
#                                  db.Column('object_id', db.Integer, db.ForeignKey('house_object.object_id')))


class HouseCategory(db.Model):
    __tablename__ = 'house_category'
    house_category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    images = db.relationship('HouseCategoryImage', backref='house_category')

    def to_json(self):
        return {
            'id': self.house_category_id,
            'name': self.name,
            'description': self.description,
            'images': [image.image_name for image in self.images]
        }


class HouseCategoryImage(db.Model):
    __tablename__ = 'house_category_image'
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'), primary_key=True)
    image_name = db.Column(db.String(128), primary_key=True)


class House(db.Model):
    __tablename__ = 'house'
    house_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))
    house_category = db.relationship('HouseCategory', backref='houses')

    def __repr__(self):
        return str(self.house_id) + str(self.name) + str(self.house_category_id) + str(self.house_category)


# class HousePrice(db.Model):
#     __tablename__ = 'house_price'
#     date = db.Column(db.DateTime, index=True, primary_key=True)
#     client_category = db.Column(db.Enum(ClientCategory), primary_key=True)
#     house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'), primary_key=True)
#     price = db.Column(db.Integer, nullable=False)
#
#     def __repr__(self) -> str:
#         return f"{self.date}, {self.client_category}, {self.house_category_id}, {self.prices}"


class Order(db.Model):
    __tablename__ = 'order'
    order_id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(OrderStatus))
    client_id = db.Column(db.Integer, db.ForeignKey('client.client_id'))
    client_category_confirmed = db.Column(db.Boolean, default=None)
    house_id = db.Column(db.Integer, db.ForeignKey('house.house_id'))
    house = db.relation('House', backref='orders')
    booking_time = db.Column(db.DateTime, index=True, default=lambda: datetime.now(tzlocal()))
    checked_in = db.Column(db.Boolean, default=False)
    person_count = db.Column(db.Integer, default=0)

    check_in_time_expected = db.Column(db.DateTime, index=True)
    check_out_time_expected = db.Column(db.DateTime, index=True)
    check_in_time_actual = db.Column(db.DateTime, default=None)
    check_out_time_actual = db.Column(db.DateTime, default=None)

    services = db.relationship('OrderService', back_populates='order')
    payments = db.relationship('Payment', backref='order')

    def to_json(self):
        return {
            'id': self.order_id,
            'status_id': self.status.value,
            'status': self.status.name,
            'person_count': self.person_count,
            'client': {
                'id': self.client.client_id,
                'category_id': self.client.client_category.value,
                'category_name': self.client.client_category.name,
                'category_confirmed': self.client_category_confirmed,
                'last_name': self.client.last_name,
                'first_name': self.client.first_name,
                'middle_name': self.client.middle_name,
                'phone': self.client.phone_number,
                'email': self.client.email,

            },
            'house': {
                'id': self.house.house_id,
                'name': self.house.name,
                'category_id': self.house.house_category_id,
                'category_name': self.house.house_category.name
            },
            'time': {
                'booking': self.booking_time.isoformat(),
                'check_in_expected': self.check_in_time_expected.isoformat(),
                'check_out_expected': self.check_out_time_expected.isoformat(),
                'check_in_actual': self.check_in_time_actual.isoformat() if self.check_in_time_actual else None,
                'check_out_actual': self.check_out_time_actual.isoformat() if self.check_out_time_actual else None,
            },
            'services': [{
                'id': order_service.order_service_id,
                'name': order_service.service.name,
                'date': order_service.order_date.isoformat(),
                'price': order_service.service.actual_price().value,
                'amount': order_service.amount,

                'is_paid': order_service.is_payed,
                'payment_id': order_service.payment_id,
                'payment_date': order_service.payment.date.isoformat() if order_service.payment else None,
            } for order_service in self.services],
            'payments': [
                {
                    'id': payment.payment_id,
                    'date': payment.date.isoformat(),
                    'total': payment.total,
                    'order_service_ids': list(map(lambda service: service.order_service_id, payment.order_services))
                } for payment in self.payments]
        }

    def __repr__(self) -> str:
        return f'(Order-{self.order_id} status={self.status} ' \
               f'client_id={self.client_id} house_id={self.house_id} ' \
               f'house={self.house} booking_time={self.booking_time} ' \
               f'check_in_time={self.check_in_time_expected} check_out_time={self.check_out_time_expected} ' \
               f'checked_in={self.checked_in})'


# class RecreationCenter(db.Model):
#     __tablename__ = 'recreation_center'
#     center_id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(64), unique=True, nullable=False)
#     description = db.Column(db.Text)
#     house_categories = db.relationship('HouseCategory', backref='recreation_center')


class Holiday(db.Model):
    __tablename__ = 'holiday'
    date = db.Column(db.DateTime, primary_key=True)


class Service(db.Model):
    __tablename__ = 'service'
    service_id = db.Column(db.Integer, primary_key=True)
    available = db.Column(db.Boolean, default=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)

    prices = db.relationship('ServicePrice', backref='service')
    orders = db.relationship('OrderService', back_populates='service')
    # sub_service = db.relationship('Service', backref='super_service')

    def price_at(self, date):
        sorted_prices = sorted(self.prices, key=lambda price: price.date_modified, reverse=True)
        return next(filter(lambda price: price.date_modified < date, sorted_prices), None)

    def actual_price(self):
        return self.price_at(datetime.now())

    def to_json(self):
        return {
            'id': self.service_id,
            'available': self.available,
            'name': self.name,
            'description': self.description,
            'price': self.prices[-1].value,
        }


class DateType(enum.Enum):
    HOLIDAY = 1
    WEEKEND = 2
    WEEKDAY = 3

    @staticmethod
    def is_weekend(date):
        return date.weekday() in (4, 5, 6)

    @staticmethod
    def get_date_type(date):
        if date.date() in map(lambda holiday: holiday.date.date(), Holiday.query.all()):
            return DateType.HOLIDAY
        elif DateType.is_weekend(date):
            return DateType.WEEKEND
        else:
            return DateType.WEEKDAY


# @extends Service
class HouseRental(db.Model):
    __tablename__ = 'house_rental'
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), primary_key=True)
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))
    client_category = db.Column(db.Enum(ClientCategory))
    date_type = db.Column(db.Enum(DateType))
    # super_service = db.relationship('Service', backref='sub_service')

    @property
    def super_service(self):
        return Service.query.filter(Service.service_id == self.service_id).first()


# @extends Service
class Excess(db.Model):
    __tablename__ = 'excess'
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), primary_key=True)
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))

    @property
    def super_service(self):
        return Service.query.filter(Service.service_id == self.service_id).first()

    # super_service = db.relationship('Service', backref='sub_service')


# @extends Service
class Extra(db.Model):
    __tablename__ = 'extra'
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), primary_key=True)
    # super_service = db.relationship('Service', backref='sub_service')

    @property
    def super_service(self):
        return Service.query.filter(Service.service_id == self.service_id).first()

    def to_json(self):
        return {
            'id': self.service_id,
            'available': self.super_service.available,
            'name': self.super_service.name,
            'description': self.super_service.description,
            'price': self.super_service.prices[-1].value,
        }


# @extends Service
class Penalty(db.Model):
    __tablename__ = 'penalty'
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), primary_key=True)
    # super_service = db.relationship('Service', backref='sub_service')

    @property
    def super_service(self):
        return Service.query.filter(Service.service_id == self.service_id).first()


class ServicePrice(db.Model):
    __tablename__ = 'service_price'
    price_id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'))
    date_modified = db.Column(db.DateTime, default=lambda: datetime.now(tzlocal()))
    value = db.Column(db.Integer, default=0)

    @property
    def super_service(self):
        return Service.query.filter(Service.service_id == self.service_id).first()


class OrderService(db.Model):
    __tablename__ = 'order_service'
    order_service_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'))
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'))
    amount = db.Column(db.Integer, nullable=False)
    is_payed = db.Column(db.Boolean, default=False)
    order_date = db.Column(db.DateTime, default=lambda: datetime.now(tzlocal()))
    payment_id = db.Column(db.Integer, db.ForeignKey('payment.payment_id'))
    order = db.relationship('Order', back_populates='services')
    service = db.relationship('Service', back_populates='orders')
    payment = db.relationship('Payment', backref='order_services')


# class Price(db.Model):
#     __tablename__ = 'price'
#     price_id = db.Column(db.Integer, primary_key=True)
#     date_when_price_set = db.Column(db.DateTime, default=lambda: datetime.now(tzlocal()))
#     value = db.Column(db.Integer, nullable=False)


# class HousePrice(db.Model):
#     __tablename__ = 'house_price'
#     price_id = db.Column(db.Integer, db.ForeignKey('price.price_id'), primary_key=True)
#     date = db.Column(db.DateTime, index=True)
#     client_category = db.Column(db.Enum(ClientCategory))
#     house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))
#
#
# class SurchargePrice(db.Model):
#     __tablename__ = 'surcharge_price'
#     price_id = db.Column(db.Integer, db.ForeignKey('price.price_id'), primary_key=True)
#     surcharge_for = db.Column(db.Enum(Extra))
#     house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))
#
#
# class ServicePrice(db.Model):
#     __tablename__ = 'service_price'
#     price_id = db.Column(db.Integer, db.ForeignKey('price.price_id'), primary_key=True)
#     service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'))
#
#
# class PenaltyPrice(db.Model):
#     __tablename__ = 'penalty_price'
#     price_id = db.Column(db.Integer, db.ForeignKey('price.price_id'), primary_key=True)
#     penalty_id = db.Column(db.Integer, db.ForeignKey('penalty.penalty_id'))


# class Penalty(db.Model):
#     __tablename__ = 'penalty'
#     penalty_id = db.Column(db.Integer, primary_key=True)
#     penalty_name = db.Column(db.String(64), nullable=False)
#     penalty_description = db.Column(db.Text)


class Payment(db.Model):
    __tablename__ = 'payment'
    payment_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'))
    date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(tzlocal()))
    total = db.Column(db.Integer)


# class OrderItem(db.Model):
#     __tablename__ = 'item'
#     order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'), primary_key=True)
#     item_id = db.Column(db.Integer, db.ForeignKey('price.price_id'), primary_key=True)
#     # if null => item was not payed yet
#     payment_id = db.Column(db.Integer, db.ForeignKey('payment.payment_id'), nullable=True)

#
# class PaymentMethod(db.Model):
#     __tablename__ = 'payment_method'
#     payment_method_id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(64), unique=True, nullable=False)
#
#
# class PaymentStatus(enum.Enum):
#     PENDING = 1
#     CANCELLED = 2
#     FULFILLED = 3
#     PROCESSING_WITHDRAW = 4
#     WITHDRAW = 5
#
#
# class Payment(db.Model):
#     __tablename__ = 'payment'
#     payment_id = db.Column(db.Integer, primary_key=True)
#     payment_status = db.Column(db.Enum(PaymentStatus))
#     payment_method_id = db.Column(db.Integer, db.ForeignKey('payment_method.payment_method_id'), primary_key=True)
#     payment_time = db.Column(db.DateTime, primary_key=True)
#     amount = db.Column(db.Integer)
#
#
# class CashlessPaymentTransaction(db.Model):
#     __tablename__ = 'cashless_transaction'
#     transaction_id = db.Column(db.Integer, primary_key=True)
#     payment_id = db.Column(db.Integer, db.ForeignKey('payment.payment_id'))


# class HouseObject(db.Model):
#     __tablename__ = 'house_object'
#     object_id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(64), nullable=False)
#     description = db.Column(db.Text)
