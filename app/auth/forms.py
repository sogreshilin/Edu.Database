from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from flask_babel import _, lazy_gettext as _l
from app.models import Client, ClientCategory


class RegistrationForm(FlaskForm):
    last_name = StringField(_l('Last name'), validators=[DataRequired()])
    first_name = StringField(_l('First name'), validators=[DataRequired()])
    middle_name = StringField(_l('Middle name'))
    phone_number = StringField(_l('Phone number'), validators=[DataRequired()])
    email = StringField(_l('E-mail'), validators=[DataRequired(), Email()])
    client_categories = [(str(category.value), category.name) for category in list(ClientCategory)]
    category = SelectField(_l('Category'), choices=client_categories)
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    password_repeat = PasswordField(_l('Repeat password'), validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(_l('Register'))

    def validate_email(self, email):
        client = Client.query.filter_by(email=email.data).first()
        if client is not None:
            raise ValidationError(_(f'User with e-mail {email.data} already exists'))


class LoginForm(FlaskForm):
    email = StringField(_l('E-mail'), validators=[DataRequired()])
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    remember_me = BooleanField(_l('Remember Me'))
    submit = SubmitField(_l('Sign In'))


class ResetPasswordRequestForm(FlaskForm):
    email = StringField(_l('Email'), validators=[DataRequired(), Email()])
    submit = SubmitField(_l('Request Password Reset'))


class ResetPasswordForm(FlaskForm):
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    password_repeat = PasswordField(_l('Repeat Password'), validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(_l('Request Password Reset'))
