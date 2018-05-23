from flask import jsonify, request, Response

from app import db
from app.house.get import get_house_categories
from app.main.validators import validate_text_non_empty, validate_house_category_id
from app.models import DateType, ClientCategory, HouseCategory, HouseRental, Service, ServicePrice, HouseCategoryImage
from app.house import bp


@bp.route('/api/add/house_category', methods=['POST'])
def add_house_category():
    content = request.json
    try:
        name = validate_text_non_empty(content['name'])
        description = content.get('description', '')
        images = content.get('uploadedImages')
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)

    house_category = HouseCategory(name=name, description=description)
    db.session.add(house_category)
    for date_type in DateType:
        for client_category in ClientCategory:
            service = Service(name=f'<{date_type.name}> <{client_category.name}> <{name}>')
            db.session.add(service)
            db.session.flush()
            house_rental = HouseRental(service_id=service.service_id,
                                       house_category_id=house_category.house_category_id,
                                       client_category=client_category,
                                       date_type=date_type)
            db.session.add(house_rental)
            service_price = ServicePrice(service_id=service.service_id)
            db.session.add(service_price)

    db.session.commit()
    return get_house_categories()


@bp.route('/api/edit/house_category', methods=['POST'])
def edit_house_category():
    content = request.json
    try:
        category = validate_house_category_id(content['id'])
        name = validate_text_non_empty(content['name'])
        description = content.get('description', '')
        images = content.get('images')
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)

    print(images)
    category.name = name
    category.description = description
    for image_name in images:
        db.session.merge(HouseCategoryImage(house_category_id=category.house_category_id, image_name=image_name))

    db.session.commit()
    return get_house_categories()


@bp.route('/api/remove/house_category', methods=['POST'])
def remove_house_category():
    content = request.json
    try:
        category = validate_house_category_id(content['id'])
    except (ValueError, KeyError) as error:
        return Response(str(error), status=400)

    db.session.delete(category)
    db.session.commit()
    return get_house_categories()

