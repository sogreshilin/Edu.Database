import csv
from sqlalchemy import create_engine, MetaData, Table, sql
import os.path


from app.models import *

model = {
    Client: 'Client.csv',
    HouseCategory: 'HouseCategory.csv',
    House: 'House.csv',
    Order: 'Order.csv',
    Service: 'Service.csv',
    OrderService: 'OrderService.csv',
    ServicePrice: 'ServicePrice.csv',
    Penalty: 'Penalty.csv',
    Payment: 'Payment.csv',
}


def export_to_csv(data_dir):
    data_dir += '' if data_dir.endswith('/') else '/'

    metadata = MetaData()
    engine = create_engine('sqlite:///app.db')
    metadata.bind = engine
    db_connection = engine.connect()

    for _class, _filename in model.items():
        table = Table(_class.__tablename__, metadata, autoload=True)
        select = sql.select([table])
        result = db_connection.execute(select)

        with open(data_dir + _filename, 'w') as file:
            out_csv = csv.writer(file)
            out_csv.writerow(result.keys())
            out_csv.writerows(result)

        print('export table', str(table).ljust(20, ' '), 'to', data_dir + _filename)


def import_from_csv(data_dir):
    import pandas as pd
    data_dir += '' if data_dir.endswith('/') else '/'
    engine = create_engine('sqlite:///app.db')

    for _class, _filename in model.items():
        if os.path.exists(data_dir + _filename):
            df = pd.read_csv(data_dir + _filename)
            df.to_sql(_class.__tablename__, engine, if_exists='replace')
            print('import table', str(_class.__tablename__).ljust(20, ' '), 'from', data_dir + _filename)
