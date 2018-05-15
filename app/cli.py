import click
import os

from csv_helper import import_from_csv, export_to_csv


def register(app):
    @app.cli.group()
    def database():
        pass

    @database.command()
    def initialize():
        import_from_csv('data')

    @database.command()
    @click.argument('data_dir')
    def export_data(data_dir):
        export_to_csv(data_dir)

    @database.command()
    @click.argument('data_dir')
    def import_data(data_dir):
        import_from_csv(data_dir)

    @database.command()
    def recreate():
        if os.system('rm -rf app.db migrations'):
            raise RuntimeError('rm old db failed')
        if os.system('flask db init'):
            raise RuntimeError('db init failed')
        if os.system('flask db migrate'):
            raise RuntimeError('db migrate failed')
        if os.system('flask db upgrade'):
            raise RuntimeError('flask db upgrade failed')
        if os.system('flask database import_data data'):
            raise RuntimeError('flask database import_data failed')

    @app.cli.group()
    def translate():
        """Translation and localization commands."""
        pass

    @translate.command()
    def update():
        """Update all languages."""
        if os.system('pybabel extract -F babel.cfg -k _l -o messages.pot .'):
            raise RuntimeError('extract command failed')
        if os.system('pybabel update -i messages.pot -d app/translations'):
            raise RuntimeError('update command failed')
        os.remove('messages.pot')


    @translate.command()
    def compile():
        """Compile all languages."""
        if os.system('pybabel compile -d app/translations'):
            raise RuntimeError('compile command failed')


    @translate.command()
    @click.argument('lang')
    def init(lang):
        """Initialize a new language."""
        if os.system('pybabel extract -F babel.cfg -k _l -o messages.pot .'):
            raise RuntimeError('extract command failed')
        if os.system(
                'pybabel init -i messages.pot -d app/translations -l ' + lang):
            raise RuntimeError('init command failed')
        os.remove('messages.pot')
