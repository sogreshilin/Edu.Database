from app import db
from app.main import bp
from app.main.forms import OrderForm
from flask import render_template, flash, redirect, url_for
from flask_babel import _
from flask_login import login_required, current_user
import datetime
from app.models import House, Order, HouseCategory, Client


@bp.route('/index')
@login_required
def index():
    return render_template('index.html', title=_('Recreation Centers'))


@bp.route('/order', methods=['POST', 'GET'])
@login_required
def order():
    form = OrderForm()
    # form.check_in.data = datetime.date.today()
    # form.check_out.data = datetime.date.today() + datetime.timedelta(days=1)
    form.house_category.choices = [(category.house_category_id, category.name)
                                   for category in HouseCategory.query.order_by('name')]
    form.house.choices = [(house.house_id, house.name) for house in House.query.order_by('name')]
    if form.validate_on_submit():
        house = House.query.filter_by(house_id=form.house.data).first()
        client = current_user
        order = Order(status_id=1, client_id=client.client_id, house_id=house.house_id,
            check_in_time=form.check_in.data, check_out_time=form.check_out.data)
        db.session.add(order)
        db.session.commit()
        flash(_('House successfully ordered'))
        return redirect(url_for('main.index'))
    return render_template('main/order.html', title='Book house', form=form)


@bp.route('/profile/orders')
@login_required
def orders():
    return render_template('main/client_orders.html', client=current_user)
