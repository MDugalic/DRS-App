from app.database import db
import uuid

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = db.Column(db.String(220), nullable=True)
    image_path = db.Column(db.String(255), nullable=True)
    approved = db.Column(db.Boolean, nullable=False, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='posts')

    def __repr__(self):
        return f"<Username {self.username}>"

    def get_id(self):
        return self.id
