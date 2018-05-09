from app import create_app, db, cli
from app.models import ClientCategory, Client, RecreationCenter, HouseCategory, HouseObject, ServicePrice, House, Order, \
        OrderStatus, HousePrice
from flask_cors import CORS
from csv_helper import export_to_csv, import_from_csv

app = create_app()
CORS(app)
cli.register(app)


@app.shell_context_processor
def make_shell_context():
    return {'db': db,
            'ClientCategory': ClientCategory,
            'Client': Client,
            'RecreationCenter': RecreationCenter,
            'House': House,
            'HouseCategory': HouseCategory,
            'HouseObject': HouseObject,
            'ServicePrice': ServicePrice,
            'Order': Order,
            'OrderStatus': OrderStatus,
            'HousePrice': HousePrice,
            'export_to_csv': export_to_csv,
            'import_from_csv': import_from_csv
            }


if __name__ == "__main__":
        app.run(threaded=True)
