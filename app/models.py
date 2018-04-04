import jwt
from flask import current_app
from app import db, login
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from time import time


@login.user_loader
def load_user(id):
    return Client.query.get(int(id))


class ClientCategory(db.Model):
    __tablename__      = 'client_category'
    client_category_id = db.Column(db.Integer, primary_key=True)
    name               = db.Column(db.String(64), index=True, unique=True, nullable=False)
    clients = db.relationship('Client', backref='category', lazy='dynamic')

    def __repr__(self):
        return 'ClientCategory-{} : {}'.format(self.client_category_id, self.name)


class Client(UserMixin, db.Model):
    __tablename__      = 'client'
    client_id          = db.Column(db.Integer, primary_key=True)
    client_category_id = db.Column(db.String(64), db.ForeignKey('client_category.client_category_id'))
    first_name         = db.Column(db.String(128), index=True, nullable=False)
    last_name          = db.Column(db.String(128), index=True, nullable=False)
    phone_number       = db.Column(db.String(32), index=True)
    email              = db.Column(db.String(128), index=True, nullable=False)
    password_hash      = db.Column(db.String(128))

    def get_id(client):
        return client.client_id

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode({'reset_password': self.client_id, 'exp': time() + expires_in},
            current_app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])['reset_password']
        except:
            return
        return Client.query.get(id)

    def __repr__(self):
        return 'Client-{} : {}, {} {}, {}, {}'.format(self.client_id, self.client_category_id,
            self.first_name, self.last_name, self.phone_number, self.email)
