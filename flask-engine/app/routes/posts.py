import os
from sqlalchemy import desc, text
from werkzeug.utils import secure_filename
from flask import request, Blueprint, jsonify, send_from_directory
from app.models import Post
from app.models import User
from app.services.mail_service import EmailService
from app.database import db
from flask_jwt_extended import jwt_required, get_jwt_identity, unset_jwt_cookies
from flask_socketio import emit
from app.socketio_instance import socketio
from datetime import datetime
from app.models.friendship import friendship
bp = Blueprint("posts", __name__)

UPLOAD_FOLDER = 'uploads'

@bp.route('/create', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    # should be implemented using session object:
    # user_id = session.get('user_id')
    # if not User.query.get(user_id):
    #     abort(403)  # Unauthorized access
    user = User.query.filter(
        User.id == user_id
    ).first()
    username = user.username
    text = request.form.get('text')
    image = request.files.get('image')

    if user_id is None:
        return {"message": "Not logged in."}, 400

    if not text and not image:
        return {"message": "The data is empty. Please provide either text or an image."}, 400

    image_path = None  # Default to None if no image is uploaded
    if image:
        # Ensure the upload folder exists
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)  # Create the folder if it doesn't exist

        # Save the image with a secure filename
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        image.save(image_path)
        print(f"Image saved to: {image_path}")

    post = Post(user_id=user_id, username=username, text=text, image_path=image_path)
    db.session.add(post)
    db.session.commit()

    # Notify all admins via email
    admins = User.query.filter(User.role == 'admin').all()
    for admin in admins:
        EmailService.send_email(
            admin.email,
            "New Post Made",
            f"The user {username} has created a new post."
        )

    # Emit new post to WebSocket clients
    post_data = {
        "id": post.id,
        "text": post.text,
        "image_path": post.image_path,
        "username": post.username,
        "created_at": post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    }
    emit('new_pending_post', post_data, broadcast=True, namespace='/')

    return {"message": "Post created successfully."}, 201

@bp.route('/uploads/<filename>')
def serve_image(filename):
    uploads_dir = os.path.join(os.getcwd(), 'uploads')  # adjust if needed
    return send_from_directory(uploads_dir, filename)

@bp.route('/get', methods=['GET'])
def get_posts_of_user():
    user_id = request.form.get('user_id')
    # should be implemented using session object:
    # user_id = session.get('user_id')
    # if not User.query.get(user_id):
    #     abort(403)  # Unauthorized access

    if user_id is None:
        return {"message": "User ID is required."}, 400
    posts = Post.query.filter_by(user_id=user_id).all()

    if not posts:
        return {"message": "No posts found for this user."}, 404

    posts_list = []
    for post in posts:
        post_data = {
            "id": post.id,
            "text": post.text,
            "image_path": post.image_path,
            "approved": post.approved,
            "created_at": post.created_at,
            "username": post.username,
        }
        posts_list.append(post_data)

    return jsonify(posts_list), 200

@bp.route('/get-friends', methods=['GET'])
@jwt_required()
def get_posts_of_friends():
    user_id = get_jwt_identity()
    if not user_id:
        return {"message": "Bad request"}, 400
    
    try:
        print(f"Current user ID: {user_id}")  # Debug logging
        
        # Get accepted friendships
        accepted_friendships = db.session.query(friendship).filter(
            ((friendship.c.user_id == user_id) | (friendship.c.friend_id == user_id)),
            friendship.c.is_accepted == True
        ).all()
        
        print(f"Found {len(accepted_friendships)} friendships")  # Debug logging
        
        # Extract friend IDs
        friend_ids = set()
        for fs in accepted_friendships:
            if fs.user_id == user_id:
                friend_ids.add(fs.friend_id)
            else:
                friend_ids.add(fs.user_id)
        
        print(f"Friend IDs before filtering: {friend_ids}")  # Debug logging
        friend_ids.discard(user_id)
        print(f"Friend IDs after filtering: {friend_ids}")  # Debug logging

        # Debug: Check if user_id accidentally appears in friend_ids
        if user_id in friend_ids:
            print("ERROR: User ID still in friend_ids after filtering!")

        # Get approved posts from friends
        posts = Post.query.filter(
            Post.user_id.in_(friend_ids),
            Post.approved == "Approved"
        ).order_by(Post.created_at.desc()).all()
        
        print(f"Found {len(posts)} posts from friends")  # Debug logging
        
        # Debug: Check if any posts belong to current user
        user_posts_count = sum(1 for post in posts if post.user_id == user_id)
        if user_posts_count > 0:
            print(f"WARNING: Found {user_posts_count} posts from current user in results!")

        posts_list = [{
            "id": post.id,
            "text": post.text,
            "image_path": post.image_path,
            "approved": post.approved,
            "created_at": post.created_at.isoformat(),
            "username": post.username,
            "user_id": post.user_id  # Include user_id for debugging
        } for post in posts]
        
        return jsonify(posts_list)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"message": "Internal server error"}, 500

@bp.route('/edit', methods=['PUT'])
def edit_post():
    post_id = request.form.get('id')
    text = request.form.get('text')
    image = request.files.get('image')

    # Check if the post ID is provided
    if not post_id:
        return {"message": "Post ID is required."}, 400

    # Fetch the post to be updated
    post = Post.query.get_or_404(post_id)

    # Update text field if provided
    if text:
        post.text = text

    if image:
        # Ensure the upload folder exists
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)  # Create the folder if it doesn't exist

        # Save the image with a secure filename
        image_filename = secure_filename(image.filename)
        new_image_path = os.path.join(UPLOAD_FOLDER, image_filename)
        image.save(new_image_path)
        print(f"New image saved to: {new_image_path}")

        # Remove the old image if it exists
        if post.image_path and os.path.exists(post.image_path):
            try:
                os.remove(post.image_path)
                print(f"Old image removed: {post.image_path}")
            except Exception as e:
                print(f"Error removing old image: {e}")

        # Update the image path in the post
        post.image_path = new_image_path

    # Commit the changes to the database
    db.session.commit()
    return {"message": "Post updated successfully."}, 200

# !!!!!!!!
# We need additional authorization
# Don't know if <id> should be passed in the URL
@bp.route('/delete/<id>', methods=['DELETE'])
@jwt_required()
def delete_post(id):
    # Authenticate user
    user_id = int(get_jwt_identity())
    if not user_id:
        return {"message": "Unauthorized. Please log in."}, 401

    # Fetch the post to delete using UUID
    post = Post.query.get_or_404(id)

    # Authorization: Check if the logged-in user owns the post
    if post.user_id != user_id:
        return {"message": "Forbidden. You do not have permission to delete this post."}, 403

    # Proceed with deletion
    db.session.delete(post)
    db.session.commit()
    return {"message": "Post deleted successfully."}, 200

@socketio.on('get_pending_posts')
def handle_get_pending_posts():
    # Query all posts with `approved` status as "Pending"
    pending_posts = Post.query.filter_by(approved="Pending").order_by(desc(Post.created_at)).all()
    
    # Prepare data to emit, formatting datetime objects
    posts_list = [{
        "id": post.id,
        "text": post.text,
        "image_path": post.image_path,
        "username": post.username,
        "created_at": post.created_at.strftime('%Y-%m-%d %H:%M:%S') if isinstance(post.created_at, datetime) else post.created_at,
    } for post in pending_posts]

    # Emit the list of posts back to the client
    emit('pending_posts_update', posts_list)

@bp.route('/approve/<string:post_id>', methods=['PUT'])
@jwt_required()
def approve_post(post_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != 'admin':
        return {"message": "Unauthorized. Only admins can approve posts."}, 403

    post = Post.query.get(post_id)
    if not post:
        return {"message": "Post not found."}, 404

    post.approved = "Approved"
    db.session.commit()
    post_user = User.query.get(post.user_id)
    EmailService.send_email(
            post_user.email,
            "Post approved",
            f"Dear {post_user.username},\n\nYour post has been approved.\n\nPost content:\n{post.text}"
        )
    # Notify clients about the updated post
    emit('post_approved', {"id": post.id}, broadcast=True, namespace='/')

    return {"message": "Post approved successfully."}, 200

@bp.route('/deny/<string:post_id>', methods=['PUT'])
@jwt_required()
def deny_post(post_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != 'admin':
        return {"message": "Unauthorized. Only admins can deny posts."}, 403

    post = Post.query.get(post_id)
    if not post:
        return {"message": "Post not found."}, 404

    # Update post approval status
    post.approved = "Denied"
    db.session.commit()

    # Get the user who created the post
    post_user = User.query.get(post.user_id)

    EmailService.send_email(
        post_user.email,
        "Post Denied",
        f"Dear {post_user.username},\n\nYour post has been denied.\n\nPost content:\n{post.text}"
    )

    # Increment denied_posts atomically
    db.session.execute(
        text("UPDATE users SET denied_posts = denied_posts + 1 WHERE id = :user_id"),
        {"user_id": post_user.id}
    )
    db.session.commit()
    db.session.refresh(post_user)

    # Check if the user needs to be blocked
    if post_user.denied_posts > 3:
        post_user.is_blocked = True
        db.session.commit()
        EmailService.send_email(
            post_user.email,
            "Account Blocked",
            f"Dear {post_user.username},\n\nYour account has been blocked due to multiple denied posts."
        )

    # Notify clients about the updated post
    emit('post_denied', {"id": post.id}, broadcast=True, namespace='/')

    return {"message": "Post denied successfully."}, 200