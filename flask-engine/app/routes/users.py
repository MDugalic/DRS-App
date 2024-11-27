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
            access_token = create_access_token(identity=str(user.id), fresh=True)
            #refresh_token = create_refresh_token(identity=user.id)
            return {"access_token": access_token} # "refresh_token": refresh_token}
        
        abort(401, message="Invalid credentials.")

@users_bp.route("/update_profile")
class UpdateUserProfile(MethodView):
    @users_bp.arguments(UserSchema)
    @users_bp.response(200, UserSchema)
    @jwt_required()
    def put(self, updated_data):
        # Fetch the user ID from the token
        current_user_id = get_jwt_identity()
        user = UserModel.query.get(current_user_id)

        if not user:
            abort(404, message="User not found.")

        # Check for unique constraints: username and email
        if UserModel.query.filter(
            (UserModel.username == updated_data["username"]) & (UserModel.id != current_user_id)
        ).first():
            abort(400, message="Username is already taken.")

        if UserModel.query.filter(
            (UserModel.email == updated_data["email"]) & (UserModel.id != current_user_id)
        ).first():
            abort(400, message="Email is already taken.")

        # Update fields
        user.first_name = updated_data["first_name"]
        user.last_name = updated_data["last_name"]
        user.address = updated_data["address"]
        user.city = updated_data["city"]
        user.country = updated_data["country"]
        user.phone_number = updated_data["phone_number"]
        user.email = updated_data["email"]
        user.username = updated_data["username"]
        user.password = updated_data["password"]  # Consider hashing the password

        # Commit changes to the database
        try:
            db.session.commit()
        except SQLAlchemyError:
            abort(500, message="Error updating profile.")

        return user

@users_bp.route("/get_current_user", methods=["GET"])
class GetUserProfile(MethodView):
    @jwt_required()
    def get(self):
        # Fetch the user ID from the token
        user_id = get_jwt_identity()

        # Fetch user data from the database
        user = UserModel.query.get(user_id)

        if not user:
            abort(404, message="User not found.")
        
        # Return only the necessary fields (to match frontend expectations)
        user_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "address": user.address,
            "city": user.city,
            "country": user.country,
            "phone_number": user.phone_number,
            "email": user.email,
            "username": user.username,
            "password": user.password,
        }

        return user_data
    