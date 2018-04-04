from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo
from app.models import Client
from flask_babel import _, lazy_gettext as _l


class RegistrationForm(FlaskForm):
    first_name = StringField(_l('First name'), validators=[DataRequired()])
    last_name = StringField(_l('Last name'), validators=[DataRequired()])
    phone_number = StringField(_l('Phone number'), validators=[DataRequired()])
    email = StringField(_l('E-mail'), validators=[DataRequired(), Email()])
    category = SelectField(_l('Category'), choices=[('2', _('Company worker')), ('1', _('Non-company worker'))])
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    password_repeat = PasswordField(_l('Repeat password'), validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(_l('Register'))

    def validate_email(self, email):
        client = Client.query.filter_by(email=email.data).first()
        if client is not None:
            raise ValidationError(_('User with e-mail: %(email) already exists', email=email.data))


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
