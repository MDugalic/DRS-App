from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.database import db
from app.models import User
from app.models.friendship import friendship

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/send_request/<int:friend_id>', methods=['POST'])
@login_required
def send_request(friend_id):
    user = User.query.get_or_404(friend_id)

    if current_user.id == friend_id:
        return jsonify({"message": "You cannot send a friend request to yourself."}), 400
    
    # Check if a request already exists
    existing_request = db.session.query(friendship).filter_by(
        user_id=current_user.id, 
        friend_id=friend_id
    ).first()

    if existing_request:
        return jsonify({"message": "Friend request already sent."}), 400
    
    # Add a pending friend request
    stmt = friendship.insert().values(
        user_id=current_user.id,
        friend_id=friend_id,
        is_accepted=True
    )
    db.session.execute(stmt)
    db.session.commit()

    return jsonify({"message": f"Friend request sent to {user.username}."}), 200

@friends_bp.route('/accept_request/<int:friend_id>', methods=['POST'])
@login_required
def accept_request(friend_id):
    # Update the friend request status to 'ACCEPTED'
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user.id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    db.session.execute(
        friendship.update()
        .where(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id)
        .values(is_accepted=True)
    )
    db.session.commit()

    return jsonify({"message": "Friend request accepted."}), 200

@friends_bp.route('/reject_request/<int:friend_id>', methods=['POST'])
@login_required
def reject_request(friend_id):
    # Delete the friend request
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user.id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    db.session.execute(
        friendship.delete().where(
            friendship.c.user_id == friend_id, friendship.c.friend_id == current_user.id
        )
    )
    db.session.commit()

    return jsonify({"message": "Friend request rejected."}), 200

@friends_bp.route('/remove_friend/<int:friend_id>', methods=['POST'])
@login_required
def remove_friend(friend_id):
    user = User.query.get_or_404(friend_id)
    if user:
        current_user.remove_friend(user)
        db.session.commit()
        return jsonify({"message": f"{user.username} removed from friends."}), 200

@friends_bp.route('/is_friend/<int:user_id>', methods=['GET'])
@login_required
def is_friend(user_id):
    # Fetch the user to check against
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    # Check if the current user is friends with the target user
    is_friend = current_user.friends.filter(
        friendship.c.friend_id == user_id,
        friendship.c.is_accepted == True
    ).count() > 0

    return jsonify({"is_friend": is_friend}), 200

@friends_bp.route('/list_all', methods=['GET'])
@login_required
def list_friends():
    friends = current_user.friends.all()
    return jsonify([{"id": friend.id, "username": friend.username} for friend in friends])
