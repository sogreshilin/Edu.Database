from app import create_app, db, cli
from app.models import ClientCategory, Client, RecreationCenter, HouseCategory, HouseObject, ServicePrice, House, Order


app = create_app()
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
            'Order': Order}


if __name__ == "__main__":
        app.run()
