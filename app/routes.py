from app import app, db, login
from flask import render_template, flash, redirect, url_for, request
from flask_login import current_user, login_user, login_required, logout_user
from app.forms import RegistrationForm, LoginForm
from app.models import Client, ClientCategory
from werkzeug.urls import url_parse
from flask_babel import _
from app.forms import ResetPasswordRequestForm
from app.email import send_password_reset_email
from app.forms import ResetPasswordForm


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        category = ClientCategory.query.filter_by(name=form.category.data).first()
        client = Client(category=category,
            first_name=form.first_name.data,
            last_name=form.last_name.data,
            phone_number=form.phone_number.data,
            email=form.email.data)
        client.set_password(form.password.data)
        db.session.add(client)
        db.session.commit()
        flash(_('Congratulations, you are now a registered user!'))
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        client = Client.query.filter_by(email=form.email.data).first()
        print(client)
        if client is None:
            flash(_('No username with such email found'))
            print('redirecting')
            return redirect(url_for('login'))
        elif not client.check_password(form.password.data):
            flash(_('Invalid password'))
            return redirect(url_for('login'))
        login_user(client, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign in', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/index')
@login_required
def index():
    return render_template('index.html', title='Recreation Centers')


@app.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        client = Client.query.filter_by(email=form.email.data).first()
        if client:
            send_password_reset_email(client)
        flash(_('Check your email for the instructions to reset your password'))
        return redirect(url_for('login'))
    return render_template('reset_password_request.html', title=_('Reset Password'), form=form)


@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    client = Client.verify_reset_password_token(token)
    if not client:
        return redirect(url_for('index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        client.set_password(form.password.data)
        db.session.commit()
        flash(_('Your password has been reset.'))
        return redirect(url_for('login'))
    return render_template('reset_password.html', form=form)
