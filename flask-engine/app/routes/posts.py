import os
from werkzeug.utils import secure_filename
from flask import request, Blueprint, jsonify
from app.models import Post
from app.database import db

bp = Blueprint("posts", __name__)

UPLOAD_FOLDER = 'uploads'

@bp.route('/create', methods=['POST'])
def create_post():
    user_id = request.form.get('user_id')
    # should be implemented using session object:
    # user_id = session.get('user_id')
    # if not User.query.get(user_id):
    #     abort(403)  # Unauthorized access

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

    post = Post(user_id = user_id, text = text, image_path = image_path)
    db.session.add(post)
    db.session.commit()
    return {"message": "Post created successfully."}, 201

@bp.route('/get', methods=['GET'])
def get_post():
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
        }
        posts_list.append(post_data)

    return jsonify(posts_list), 200

    
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
def delete_post(id):
    if not id:
        return {"message": "Post ID is required."}, 400

    post = Post.query.get_or_404(id)
    
    db.session.delete(post)
    db.session.commit()
    return {"message": "Post deleted successfully."}, 200