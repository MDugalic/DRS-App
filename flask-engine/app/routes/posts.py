import os
from werkzeug.utils import secure_filename
from flask import request, Blueprint
from app.models import Post
from app.database import db

bp = Blueprint("posts", __name__)

UPLOAD_FOLDER = 'uploads'

@bp.route('/create_post', methods=['POST'])
def create_post():
    username = request.form.get('username')
    text = request.form.get('text')
    image = request.files.get('image')

    if username is None:
        return {"message": "Not logged in."}, 400

    if not text and not image:
        return {"message": "The data is empty. Please provide either text or an image."}, 400

    print(image)
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

    post = Post(username = username, text = text, image_path = image_path)
    db.session.add(post)
    db.session.commit()
    return {"message": "Post created successfully."}, 201
