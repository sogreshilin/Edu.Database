from app import db
from app.main import bp
from flask import render_template
from flask_babel import _
from flask_login import login_required


@bp.route('/index')
@login_required
def index():
    return render_template('index.html', title=_('Recreation Centers'))
