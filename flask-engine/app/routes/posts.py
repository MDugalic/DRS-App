import os
from sqlalchemy import desc
from werkzeug.utils import secure_filename
from flask import request, Blueprint, jsonify, send_from_directory
from app.models import Post
from app.models import User
from app.services.mail_service import EmailService
from app.database import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit
from app.socketio_instance import socketio
from datetime import datetime
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
    user = User.query.get_or_404(user_id)
    friends_list = user.friends.union(user.friend_of).all()
    posts_by_all_friends = []
    
    # Collect posts from all friends
    for friend in friends_list:
        # Extract the posts for the current friend
        friend_posts = [{
            "id": post.id,
            "text": post.text,
            "image_path": post.image_path,
            "approved": post.approved,
            "created_at": post.created_at,
            "username": post.username,
        } for post in friend.posts if post.approved == "Approved"]
        
        posts_by_all_friends.extend(friend_posts)  # Combine all friend's posts into the main list
        posts_by_all_friends = sorted(posts_by_all_friends, key=lambda x: x['created_at'], reverse=True)
    return jsonify(posts_by_all_friends)

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

    post.approved = "Denied"
    db.session.commit()
    post_user = User.query.get(post.user_id)
    EmailService.send_email(
            post_user.email,
            "Post denied",
            f"Dear {post_user.username},\n\nYour post has been denied.\n\nPost content:\n{post.text}"
        )
    # Notify clients about the updated post
    emit('post_denied', {"id": post.id}, broadcast=True, namespace='/')

    return {"message": "Post denied successfully."}, 200