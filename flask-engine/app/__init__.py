import os
from flask import Flask
from flask_login import LoginManager
from flask_smorest import Api
from flask_migrate import Migrate
from .routes.users import users_bp
from .routes.posts import bp as posts_bp
from .routes.friends import friends_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .services import mail
from datetime import timedelta
from .models.user import User
from flask_socketio import SocketIO
from .database import db
from .socketio_instance import socketio

def create_app(db_url=None):
    app = Flask(__name__)

    init_swagger(app)           # Configure swagger settings
    configure_db(app, db_url)   # Configure database
    configure_mail(app)         # Configure mail
    api = Api(app)              # Connect flask-smorest with the app
    migrate = Migrate(app, db)  # Alembic migrations
    CORS(app, origins="http://localhost:3000")

    # Set a separate secret key for session management
    app.secret_key = "secret_key_here"

    # jwt setup
    app.config["JWT_SECRET_KEY"] = "secret_key"
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=365*100)
    jwt = JWTManager(app)

    # login manager
    login_manager = LoginManager(app)
    #login_manager.login_view = "users.UserLogin"

    @login_manager.user_loader
    def load_user(user_id):
    # This function will be called to get the user object based on user_id
        return User.query.get(int(user_id))

    
    api.register_blueprint(users_bp)                 # flask-smorest blueprint is in api
    app.register_blueprint(posts_bp, url_prefix="/posts")  # flask blueprint is in app
    app.register_blueprint(friends_bp, url_prefix="/friends")
    socketio.init_app(app, cors_allowed_origins="http://localhost:3000")
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
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url or os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/drs_db"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

def configure_mail(app):
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'drs.social.media.ftn@gmail.com'  # Your project email
    app.config['MAIL_PASSWORD'] = 'beli vudo nwye gtte'                      # The password you set
    app.config['MAIL_DEFAULT_SENDER'] = 'drs.social.media.ftn@gmail.com'  # Sender email

    mail.init_app(app)  # Initialize Flask-Mail with the app

app = create_app()
if __name__ == "__main__":
    app.run(debug=True)