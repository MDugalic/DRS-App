from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models import User as UserModel
from ..database import db

from ..schemas import UserSchema

users_bp = Blueprint("users", __name__)

@users_bp.route("/register/")
class RegisterUser(MethodView):
    #Register new user
    @users_bp.arguments(UserSchema)
    @users_bp.response(201, UserSchema)
    def post(self, user_data):
        user = UserModel(**user_data)
        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:  # Data isn't valid with the db model
            abort(400, message = "Consistency error")
        except SQLAlchemyError: # Generic error
            abort(500, message="Error")

        return user

    