from flask import jsonify

from app import db
from app.models import Extra, Excess, Penalty, DateType, ClientCategory, HouseCategory, HouseRental
from app.service import bp


def get_services(_service_subclass):
    services = {service.service_id: service.to_json()
                for service in _service_subclass.query.all() if service.super_service.available}
    return jsonify(services)


@bp.route('/api/extras')
def get_extras():
    return get_services(Extra)


@bp.route('/api/excesses')
def get_excesses():
    return get_services(Excess)


@bp.route('/api/penalties')
def get_penalties():
    return get_services(Penalty)


@bp.route('/api/house_rental')
def get_house_rental():
    return jsonify([{
            'service_id': house_rental.service_id,
            'date_type': house_rental.date_type.value,
            'client_category_id': house_rental.client_category.value,
            'house_category_id': house_rental.house_category_id,
            'price': house_rental.super_service.actual_price().value
        } for house_rental in HouseRental.query.all()]
    )
