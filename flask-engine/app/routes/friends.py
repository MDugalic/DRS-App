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

    return jsonify( requests_list), 200

# Count pending friend requests for the current user, used in the header on frontend
@friends_bp.route('/get_request_count', methods=['GET'])
@jwt_required()
def get_request_count():
    current_user_id = get_jwt_identity()
    count = db.session.query(friendship).filter_by(
        friend_id=current_user_id,
        is_accepted=False
    ).count()
    
    return jsonify({"count": count}), 200

@friends_bp.route('/accept_request/<int:friend_id>', methods=['POST'])
@jwt_required()
def accept_request(friend_id):
    current_user_id = get_jwt_identity()

    # Find original friend request
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user_id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    # Accept original request
    db.session.execute(
        friendship.update()
        .where(
            (friendship.c.user_id == friend_id) &
            (friendship.c.friend_id == current_user_id)
        )
        .values(is_accepted=True)
    )

    # Check for reverse entry, and insert if missing
    reverse = db.session.query(friendship).filter_by(
        user_id=current_user_id,
        friend_id=friend_id
    ).first()

    if not reverse:
        db.session.execute(
            friendship.insert().values(
                user_id=current_user_id,
                friend_id=friend_id,
                is_accepted=True
            )
        )
    else:
        # If reverse exists but wasn't accepted, mark as accepted
        db.session.execute(
            friendship.update()
            .where(
                (friendship.c.user_id == current_user_id) &
                (friendship.c.friend_id == friend_id)
            )
            .values(is_accepted=True)
        )

    db.session.commit()
    return jsonify({"message": "Friend request accepted."}), 200



@friends_bp.route('/reject_request/<int:friend_id>', methods=['POST'])
@jwt_required()
def reject_request(friend_id):
    current_user_id = get_jwt_identity()

    # Find the friend request to reject
    request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user_id,
        is_accepted=False
    ).first()

    if not request:
        return jsonify({"message": "No friend request found."}), 404

    # Delete the friend request
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

    # Check friendship in both directions
    friendship_record = db.session.query(friendship).filter(
        ((friendship.c.user_id == current_user_id) & (friendship.c.friend_id == friend_id)) |
        ((friendship.c.user_id == friend_id) & (friendship.c.friend_id == current_user_id)),
        friendship.c.is_accepted == True
    ).first()

    if not friendship_record:
        return jsonify({"message": f"You are not friends with {user.username}."}), 404
    
    # Delete both directions of the friendship
    db.session.execute(
        friendship.delete().where(
            ((friendship.c.user_id == current_user_id) & (friendship.c.friend_id == friend_id)) |
            ((friendship.c.user_id == friend_id) & (friendship.c.friend_id == current_user_id))
        )
    )
    db.session.commit()

    return jsonify({"message": f"{user.username} removed from friends."}), 200

@friends_bp.route('/is_friend/<int:user_id>', methods=['GET'])
@jwt_required()
def is_friend(user_id):
    current_user_id = get_jwt_identity()

    # Fetch the user to check against
    target_user = User.query.get_or_404(user_id)

    # Check if the current user is friends with the target user in either direction
    is_friend = db.session.query(friendship).filter(
        ((friendship.c.user_id == current_user_id) & (friendship.c.friend_id == user_id)) |
        ((friendship.c.user_id == user_id) & (friendship.c.friend_id == current_user_id)),
        friendship.c.is_accepted == True
    ).count() > 0

    return jsonify({"is_friend": is_friend}), 200

@friends_bp.route('/get_all', methods=['GET'])
@jwt_required()
def get_all():
    current_user_id = int(get_jwt_identity())
    
    # Get all friendships (both directions)
    friendships = db.session.query(friendship).filter(
        ((friendship.c.user_id == current_user_id) | 
         (friendship.c.friend_id == current_user_id)),
        friendship.c.is_accepted == True
    ).all()

    # Collect friend IDs with explicit self-friend check
    friend_ids = []
    for f in friendships:
        if f.user_id == current_user_id:
            if f.friend_id != current_user_id:
                friend_ids.append(f.friend_id)
        else:
            if f.user_id != current_user_id:
                friend_ids.append(f.user_id)

    # Get unique friends and their details
    unique_friend_ids = list(set(friend_ids))  # Remove duplicates
    friends = User.query.filter(User.id.in_(unique_friend_ids)).all()
    
    return jsonify([{
        "id": friend.id, 
        "username": friend.username
    } for friend in friends])


# New method to track friend request status
@friends_bp.route('/request_status/<int:friend_id>', methods=['GET'])
@jwt_required()
def request_status(friend_id):
    current_user_id = get_jwt_identity()

    # Check if the user has sent a request to the friend
    sent_request = db.session.query(friendship).filter_by(
        user_id=current_user_id,
        friend_id=friend_id
    ).first()

    # Check if the friend has sent a request to the user
    received_request = db.session.query(friendship).filter_by(
        user_id=friend_id,
        friend_id=current_user_id
    ).first()

    if sent_request and sent_request.is_accepted:
        return jsonify({"status": "accepted"}), 200
    elif sent_request and not sent_request.is_accepted:
        return jsonify({"status": "pending"}), 200
    elif received_request and not received_request.is_accepted:
        return jsonify({"status": "received"}), 200
    else:
        return jsonify({"status": "not friends"}), 200
    

# Helper method if two-way friends logic fails
def get_all_friends(user_id):
    friendships = db.session.query(friendship).filter(
        ((friendship.c.user_id == user_id) | (friendship.c.friend_id == user_id)) &
        (friendship.c.is_accepted == True)
    ).all()

    friend_ids = [
        f.friend_id if f.user_id == user_id else f.user_id for f in friendships
    ]
    return User.query.filter(User.id.in_(friend_ids)).all()
