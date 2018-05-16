from app import create_app, db, cli
from app.models import ClientCategory, Client, HouseCategory, House, Order, \
        OrderStatus, Service, OrderService, Extra, DateType
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
            'House': House,
            'HouseCategory': HouseCategory,
            'Order': Order,
            'OrderStatus': OrderStatus,
            'Service': Service,
            'OrderService': OrderService,
            'DateType': DateType,
            'Extra': Extra,
            'export_to_csv': export_to_csv,
            'import_from_csv': import_from_csv
            }


if __name__ == "__main__":
        # app.run(threaded=True, host='192.168.0.20',port=5000)
        app.run(threaded=True)
