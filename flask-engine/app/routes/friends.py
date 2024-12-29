from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.models import User
from app.models.friendship import friendship

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/send_request/<int:friend_id>', methods=['POST'])
@jwt_required()
def send_request(friend_id):
    user = User.query.get_or_404(friend_id)
    current_user_id = get_jwt_identity()

    if current_user_id == friend_id:
        return jsonify({"message": "You cannot send a friend request to yourself."}), 400

    # Check if a request already exists
    existing_request = db.session.query(friendship).filter_by(
        user_id=current_user_id,
        friend_id=friend_id
    ).first()

    if existing_request:
        return jsonify({"message": "Friend request already sent."}), 400

    # Add a pending friend request
    stmt = friendship.insert().values(
        user_id=current_user_id,
        friend_id=friend_id,
        is_accepted=False  # Should be False initially
    )
    db.session.execute(stmt)
    db.session.commit()

    return jsonify({"message": f"Friend request sent to {user.username}."}), 200


@friends_bp.route('/get_requests', methods=['GET'])
@jwt_required()
def get_requests():
    current_user_id = get_jwt_identity()

    # Fetch all pending friend requests sent to the current user
    pending_requests = db.session.query(friendship).filter_by(
        friend_id=current_user_id,
        is_accepted=False
    ).all()

    # Prepare the response data
    requests_list = []
    for request in pending_requests:
        user = User.query.get(request.user_id)  # Get the user who sent the request
        if user:
            requests_list.append({"id": user.id, "username": user.username})

    return jsonify({"requests": requests_list}), 200


@friends_bp.route('/accept_request/<int:friend_id>', methods=['POST'])
@jwt_required()
def accept_request(friend_id):
    current_user_id = get_jwt_identity()

    # Update the friend request status to 'ACCEPTED'
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user_id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    db.session.execute(
        friendship.update()
        .where(friendship.c.user_id == friend_id, friendship.c.friend_id == current_user_id)
        .values(is_accepted=True)
    )
    db.session.commit()

    return jsonify({"message": "Friend request accepted."}), 200


@friends_bp.route('/reject_request/<int:friend_id>', methods=['POST'])
@jwt_required()
def reject_request(friend_id):
    current_user_id = get_jwt_identity()

    # Delete the friend request
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user_id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    db.session.execute(
        friendship.delete().where(
            friendship.c.user_id == friend_id, friendship.c.friend_id == current_user_id
        )
    )
    db.session.commit()

    return jsonify({"message": "Friend request rejected."}), 200


@friends_bp.route('/remove_friend/<int:friend_id>', methods=['POST'])
@jwt_required()
def remove_friend(friend_id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(friend_id)

    if user:
        current_user = User.query.get(current_user_id)  # Get the current user object
        current_user.remove_friend(user)  # Ensure you have this method implemented
        db.session.commit()
        return jsonify({"message": f"{user.username} removed from friends."}), 200

@friends_bp.route('/is_friend/<int:user_id>', methods=['GET'])
@jwt_required()
def is_friend(user_id):
    current_user_id = get_jwt_identity()

    # Fetch the user to check against
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    # Check if the current user is friends with the target user
    is_friend = db.session.query(friendship).filter(
        friendship.c.friend_id == user_id,
        friendship.c.user_id == current_user_id,
        friendship.c.is_accepted == True
    ).count() > 0

    return jsonify({"is_friend": is_friend}), 200


@friends_bp.route('/get_all', methods=['GET'])
@jwt_required()
def get_all():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    friends = current_user.friends.all()  # Make sure you have the relationship set up
    return jsonify([{"id": friend.id, "username": friend.username} for friend in friends])
