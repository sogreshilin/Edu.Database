from flask import Response, request

from app import db
from app.main.validators import validate_text_non_empty, validate_service_id
from app.models import Service, Extra, ServicePrice, Penalty, Excess, HouseRental
from app.routes.service import bp
from app.routes.service import get_services, get_house_rental


def _add_service(content, _class):
    try:
        name = validate_text_non_empty(content['name'])
        price = int(content['price'])
        description = content['description']
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    service = Service(name=name, description=description)
    db.session.add(service)
    db.session.commit()

    extra = _class(service_id=service.service_id)
    db.session.add(extra)
    db.session.commit()

    service_price = ServicePrice(service_id=service.service_id, value=price)
    db.session.add(service_price)
    db.session.commit()

    return get_services(_class)


def _edit_service(content, _class):
    content = request.json
    try:
        service = validate_service_id(int(content['id']), _class)
        name = validate_text_non_empty(content['name'])
        price = int(content['price'])
        description = content['description']
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    service.name = name
    service.description = description
    db.session.add(ServicePrice(service_id=service.service_id, value=price))
    db.session.commit()
    return get_services(_class)


def _remove_service(content, _class):
    try:
        service = validate_service_id(int(content['id']), _class)
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)
    service.super_service.available = False
    db.session.commit()
    return get_services(_class)


@bp.route('/api/add/house_rental', methods=['POST'])
def add_house_rental():
    return Response("Not implemented", status=501)


@bp.route('/api/add/excess', methods=['POST'])
def add_excess():
    return Response("Not implemented", status=501)


@bp.route('/api/add/extra', methods=['POST'])
def add_extra():
    return _add_service(request.json, Extra)


@bp.route('/api/add/penalty', methods=['POST'])
def add_penalty():
    return _add_service(request.json, Penalty)


@bp.route('/api/edit/excess', methods=['POST'])
def edit_excess():
    return _edit_service(request.json, Excess)


@bp.route('/api/edit/extra', methods=['POST'])
def edit_extra():
    return _edit_service(request.json, Extra)


@bp.route('/api/edit/penalty', methods=['POST'])
def edit_penalty():
    return _edit_service(request.json, Penalty)


@bp.route('/api/edit/house_rental', methods=['POST'])
def edit_house_rental():
    content = request.json['house_rental']
    print(content)
    for house_rental_price in content:
        try:
            service = validate_service_id(int(house_rental_price['id']), HouseRental)
            price = int(house_rental_price['price'])
        except (ValueError, KeyError) as error:
            return Response(str(error), status=400)
        if service.super_service.actual_price() != price:
            db.session.add(ServicePrice(service_id=service.service_id, value=price))
    db.session.commit()
    return get_house_rental()


@bp.route('/api/remove/excess', methods=['POST'])
def remove_excess():
    return Response("Not implemented", status=501)


@bp.route('/api/remove/penalty', methods=['POST'])
def remove_penalty():
    return _remove_service(request.json, Penalty)


@bp.route('/api/remove/extra', methods=['POST'])
def remove_extra():
    return _remove_service(request.json, Extra)


@bp.route('/api/remove/house_rental', methods=['POST'])
def remove_house_rental():
    return Response("Not implemented", status=501)


