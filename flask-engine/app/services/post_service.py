from app.models.post import Post
from app.database import db

class PostService:
    
    @staticmethod
    def create_post(username, text, image_path):
        if not (text or image_path):
            return {"message": "Missing data"}, 400
        
        post = Post(username = username, text = text, image_path = image_path)
        db.session.add(post)
        db.session.commit()
        return {"message": "Post successfully created."}, 201
