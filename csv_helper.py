import csv

from app import db
from app.models import HouseCategory, House, HousePrice


def export_to_csv(data_dir):
    with open(data_dir + '/house_prices.csv', 'w') as csvfile:
        writer = csv.writer(csvfile)
        for current in HousePrice.query.all():
            writer.writerow([getattr(current, column.name) for column in HousePrice.__mapper__.columns])


def import_from_csv(data_dir):
    with open(data_dir + '/house_categories.csv') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            house_category = HouseCategory(house_category_id=int(row[0]), name=row[1], description=row[2])
            db.session.merge(house_category)
        db.session.commit()

    with open(data_dir + '/houses.csv') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            house = House(house_id=int(row[0]), name=row[1], house_category_id=int(row[2]), description=row[3])
            db.session.merge(house)
        db.session.commit()
