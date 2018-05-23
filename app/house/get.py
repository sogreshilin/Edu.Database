from flask import jsonify

from app.models import HouseCategory
from app.house import bp


@bp.route('/api/house_categories')
def get_house_categories():
    house_categories = {category.house_category_id: category.to_json() for category in HouseCategory.query.all()}
    return jsonify(house_categories)



