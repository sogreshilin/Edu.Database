import datetime
from flask_wtf import FlaskForm
from wtforms import SelectField, SubmitField, ValidationError
from wtforms.fields.html5 import DateField
from flask_babel import _, lazy_gettext as _l


class OrderForm(FlaskForm):
    house_category = SelectField(_l('House category'), choices=[], coerce=int)
    house = SelectField(_l('House'), choices=[], coerce=int)
    check_in = DateField(_l('Check in date'), format='%Y-%m-%d')
    check_out = DateField(_l('Check out date'), format='%Y-%m-%d')
    submit = SubmitField(_l('Create order'))

    def validate_check_in(self, check_in):
        if self.check_in.data < datetime.date.today():
            raise ValidationError(_('Invalid check in time: cannot be earlier than today'))

    def validate_check_out(self, check_out):
        if self.check_in.data >= self.check_out.data:
            raise ValidationError(_('Invalid check out time: must be later than check in date'))
