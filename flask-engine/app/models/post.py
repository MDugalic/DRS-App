import uuid
from app.database import db
from sqlalchemy import Column, String, Boolean


class Post(db.Model):
    __tablename__ = 'posts'

    Id = db.Column(db.String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    Username = db.Column(db.String(255), nullable=False)
    Txt = db.Column(db.String(255), nullable=True)
    ImagePath = db.Column(db.String(255), nullable=True)
    Approved = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"<Username {self.Username}>"

    def get_id(self):
        return self.Id
