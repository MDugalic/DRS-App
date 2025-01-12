from flask import request, jsonify, redirect, url_for
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models import User as UserModel
from app.models import Post as PostModel
from ..database import db
from ..schemas import UserLoginSchema
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, get_jwt
from app.blocklist import BLOCKLIST
from flask_login import login_user, logout_user, login_required, current_user
from app.services.mail_service import EmailService

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
        EmailService.send_email(
            recipient=user.email,
            subject=f"You have been registered to our social media!",
            body=f"Dear {user.first_name},\n\nYour have been registered.\n\n\tYour username: {user.username}\n\tYour password: {user.password}\n\nBest regards,\nOur team"
        )
        return user

@users_bp.route("/login")
class UserLogin(MethodView):
    @users_bp.arguments(UserLoginSchema)
    def post(self, login_data):
        user = UserModel.query.filter(
            UserModel.username == login_data["username"]
        ).first()

        # if user is not None, and password matches return token
        if user:
            if user.is_blocked:  #CHANGE HERE: Check if user is blocked
                abort(401, message="Account is blocked.")  #CHANGE HERE: Blocked account message
            
            if login_data["password"] == user.password:
                login_user(user)
                access_token = create_access_token(identity=str(user.id), fresh=True)
                #refresh_token = create_refresh_token(identity=user.id)
                if user.first_login:
                    # Update first_login flag
                    user.first_login = False
                    db.session.commit()

                    # Query all admin users
                    admins = UserModel.query.filter(UserModel.role == 'admin').all()

                    # Send an email to all admins
                    for admin in admins:
                        EmailService.send_email(
                            admin.email,
                            "New User Logged In",
                            f"A new user has logged in: {user.username}. This is their first login."
                        )
                return {"access_token": access_token} # "refresh_token": refresh_token
        
        abort(401, message="Invalid credentials.")  # If user doesn't exist or password mismatch


@users_bp.route("/logout")
class UserLogout(MethodView):
    @login_required
    def post(self):
        logout_user()
        return {"message": "Success"}, 200

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

@users_bp.route("/get_current_user")
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
            "role": user.role
        }

        return user_data
    
@users_bp.route("/profile/<username>")
class UserProfile(MethodView):
    @jwt_required()  # Ensure only authorized users can view profiles
    def get(self, username):
        # Fetch the current logged-in user ID
        current_user_id = get_jwt_identity()

        # Fetch the profile user by username
        user = UserModel.query.filter_by(username=username).first()

        if not user:
            abort(404, message="User not found.")

        # Check if the profile is the current logged-in user
        is_current_user = (str(user.id) == current_user_id)

        # Fetch the user's posts
        posts = PostModel.query.filter_by(user_id=user.id).order_by(desc(PostModel.created_at)).all()

        # Prepare response data
        user_data = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "address": user.address,
            "city": user.city,
            "country": user.country,
            "phone_number": user.phone_number,
            "email": user.email,
            "username": user.username,
        }

        # Prepare posts
        if posts:
            posts_data = [{"id": post.id, "text": post.text, "image_path": post.image_path, "created_at": post.created_at, "username": post.username} for post in posts]
        else:
            posts_data = None

        # Return the profile data and posts
        return jsonify({
            "user": user_data,
            "is_current_user": is_current_user,
            "posts": posts_data or "User hasn't made any posts yet."
        })

@users_bp.route('/get_block_list', methods=['GET'])
def get_block_list():
    blocked_users = UserModel.query.filter_by(is_blocked=True).all()
    blocklist_data = [{
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name
    } for user in blocked_users]
    
    return jsonify({'blocked_users': blocklist_data})

# Endpoint to unblock a user
@users_bp.route('/unblock_user/<int:user_id>', methods=['POST'])
def unblock_user(user_id):
    user_to_unblock = UserModel.query.filter_by(id=user_id).first()
    if user_to_unblock:
        user_to_unblock.is_blocked = False
        user_to_unblock.denied_posts = 0
        db.session.commit()
        return jsonify({'message': 'User has been unblocked'}), 200
    return jsonify({'message': 'User not found'}), 404