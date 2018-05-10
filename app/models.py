import jwt
import enum
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
        return 'Client-{} client_category={}, name={} {} {}, phone={}, email={}'.format(self.client_id, self.client_category,
                                                                            self.last_name, self.first_name, self.middle_name,
                                                                            self.phone_number, self.email)


class OrderStatus(enum.Enum):
    BOOKED = 1
    PAYED = 2
    ACTIVE = 3
    CANCELED = 4


house_category_object = db.Table('house_category_object', db.metadata,
                                 db.Column('house_category_id', db.Integer,
                                           db.ForeignKey('house_category.house_category_id')),
                                 db.Column('object_id', db.Integer, db.ForeignKey('house_object.object_id')))


class HouseCategory(db.Model):
    __tablename__ = 'house_category'
    house_category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    center_id = db.Column(db.Integer, db.ForeignKey('recreation_center.center_id'))
    description = db.Column(db.Text)
    objects = db.relationship('HouseObject', secondary=house_category_object)


class House(db.Model):
    __tablename__ = 'house'
    house_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'))
    image_url = db.Column(db.Text)
    house_category = db.relationship('HouseCategory', backref='houses')


class HousePrice(db.Model):
    __tablename__ = 'house_price'
    date = db.Column(db.DateTime, index=True, primary_key=True)
    client_category = db.Column(db.Enum(ClientCategory), primary_key=True)
    house_category_id = db.Column(db.Integer, db.ForeignKey('house_category.house_category_id'), primary_key=True)
    price = db.Column(db.Integer, nullable=False)

    def __repr__(self) -> str:
        return f"{self.date}, {self.client_category}, {self.house_category_id}, {self.prices}"


class Order(db.Model):
    __tablename__ = 'order'
    order_id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum(OrderStatus))
    client_id = db.Column(db.Integer, db.ForeignKey('client.client_id'))
    client_category_confirmed = db.Column(db.Boolean, default=None)
    house_id = db.Column(db.Integer, db.ForeignKey('house.house_id'))
    house = db.relation('House', backref='orders')
    booking_time = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    checked_in = db.Column(db.Boolean, default=False)

    check_in_time_expected = db.Column(db.DateTime, index=True)
    check_out_time_expected = db.Column(db.DateTime, index=True)
    check_in_time_actual = db.Column(db.DateTime, default=None)
    check_out_time_actual = db.Column(db.DateTime, default=None)

    def to_json(self):
        return {
            'id': self.order_id,
            'status_id': self.status.value,
            'status': self.status.name,
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
                'description': self.house.description,
                'category_id': self.house.house_category_id,
                'category_name': self.house.house_category.name
            },
            'time': {
                'booking': self.booking_time,
                'check_in_expected': self.check_in_time_expected,
                'check_out_expected': self.check_out_time_expected,
                'check_in_actual': self.check_in_time_actual,
                'check_out_actual': self.check_out_time_actual,
            },
        }

    def __repr__(self) -> str:
        return f'(Order-{self.order_id} status={self.status} ' \
               f'client_id={self.client_id} house_id={self.house_id} ' \
               f'house={self.house} booking_time={self.booking_time} ' \
               f'check_in_time={self.check_in_time_expected} check_out_time={self.check_out_time_expected} ' \
               f'checked_in={self.checked_in})'


class RecreationCenter(db.Model):
    __tablename__ = 'recreation_center'
    center_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    house_categories = db.relationship('HouseCategory', backref='recreation_center')


class HouseObject(db.Model):
    __tablename__ = 'house_object'
    object_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)


class Service(db.Model):
    __tablename__ = 'service'
    service_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)


class ServicePrice(db.Model):
    __tablename__ = 'service_price'
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), primary_key=True)
    price = db.Column(db.Integer, nullable=False)


class PaymentMethod(db.Model):
    __tablename__ = 'payment_method'
    payment_method_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)


class PaymentStatus(enum.Enum):
    PENDING = 1
    CANCELLED = 2
    FULFILLED = 3
    PROCESSING_WITHDRAW = 4
    WITHDRAW = 5


class Payment(db.Model):
    __tablename__ = 'payment'
    payment_id = db.Column(db.Integer, primary_key=True)
    payment_status = db.Column(db.Enum(PaymentStatus))
    payment_method_id = db.Column(db.Integer, db.ForeignKey('payment_method.payment_method_id'), primary_key=True)
    payment_time = db.Column(db.DateTime, primary_key=True)
    amount = db.Column(db.Integer)


class CashlessPaymentTransaction(db.Model):
    __tablename__ = 'cashless_transaction'
    transaction_id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payment.payment_id'))
