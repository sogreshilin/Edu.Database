from flask import render_template, current_app
from flask_babel import _
from app.email import send_email


def send_book_confirmation_email(client, order):
    token = client.get_token()
    send_email(_('Book Confirmation'),
               sender=current_app.config['ADMINS'][0],
               recipients=[client.email],
               text_body=render_template('email/book_confirmation.txt', client=client, order=order, token=token),
               html_body=render_template('email/book_confirmation.html', client=client, order=order, token=token))
