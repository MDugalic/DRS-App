from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models import User as UserModel
from ..database import db
from ..schemas import UserLoginSchema
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, get_jwt
from app.blocklist import BLOCKLIST

from ..schemas import UserSchema

users_bp = Blueprint("users", __name__)

@users_bp.route("/register")
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

@users_bp.route("/login")
class UserLogin(MethodView):
    @users_bp.arguments(UserLoginSchema)
    def post(self, login_data):
        user = UserModel.query.filter(
            UserModel.username == login_data["username"]
        ).first()

        # if user is not None, and password matches return token
        if user and login_data["password"] == user.password:
            access_token = create_access_token(identity=user.id, fresh=True)
            #refresh_token = create_refresh_token(identity=user.id)
            return {"access_token": access_token} # "refresh_token": refresh_token}
        
        abort(401, message="Invalid credentials.")

    