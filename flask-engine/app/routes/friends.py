from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.database import db
from app.models import User

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/add_friend/<int:friend_id>', methods=['POST'])
@login_required
def add_friend(friend_id):
    user = User.query.get_or_404(friend_id)
    if user:
        current_user.add_friend(user)
        db.session.commit()
        return jsonify({"message": f"{user.username} added as a friend."}), 200

@friends_bp.route('/remove_friend/<int:friend_id>', methods=['POST'])
@login_required
def remove_friend(friend_id):
    user = User.query.get_or_404(friend_id)
    if user:
        current_user.remove_friend(user)
        db.session.commit()
        return jsonify({"message": f"{user.username} removed from friends."}), 200

@friends_bp.route('/friends', methods=['GET'])
@login_required
def list_friends():
    friends = current_user.friends.all()
    return jsonify([{"id": friend.id, "username": friend.username} for friend in friends])
