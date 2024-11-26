from flask import Flask
from flask_smorest import Api
from flask_migrate import Migrate
from .routes.users import users_bp
from .routes.posts import bp as posts_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .services import mail

import os
from .database import db

#We can provide an optional parameter for the db connection string
def create_app(db_url=None):
    app = Flask(__name__)

    init_swagger(app)           # Configure swagger settings
    configure_db(app, db_url)   # Configure database
    configure_mail(app)         # Configure mail
    api = Api(app)              # Connect flask-smorest with the app
    migrate = Migrate(app, db)  # Alembic migrations
    CORS(app, origins="http://localhost:3000")

    #jwt setup
    app.config["JWT_SECRET_KEY"] = "secret_key"
    jwt = JWTManager(app)
    
    api.register_blueprint(users_bp)                 # flask-smorest blueprint is in api
    app.register_blueprint(posts_bp, url_prefix="/posts")  # flask blueprint is in app
    return app

def init_swagger(app):
    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.config["API_TITLE"] = "Stores REST API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/" 
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

def configure_db(app, db_url=None):
    #if we pass in db_url it will load that string, 
    #if we don't pass db_url, it will check env for database_url
    #if it is not found it will take the 2nd string
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url or os.getenv("DATABASE_URL", 'mysql://root:qwer@localhost/drs_db')
    #smth smth good
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    #initialises sqlalchemy extension. We give it our flask app so it can connect it to sqlalchemy
    db.init_app(app)

def configure_mail(app):
    app.config['MAIL_SERVER'] = 'smtp.example.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'your-email@example.com'
    app.config['MAIL_PASSWORD'] = 'your-password'

    mail.init_app(app)  #Init flask-mail


app = create_app()
if __name__ == "__main__":
    app.run(debug=True)