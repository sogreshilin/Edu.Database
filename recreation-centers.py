from app import app, db
from app.models import ClientCategory, Client
from app import cli


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'ClientCategory': ClientCategory, 'Client': Client}


if __name__ == '__main__':
    app.run()
