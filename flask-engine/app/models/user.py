from app.database import db
from .friendship import friendship
from flask_login import UserMixin

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, unique=True, primary_key=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100))
    city = db.Column(db.String(50))
    country = db.Column(db.String(50))
    phone_number = db.Column(db.String(20))

    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # 'user', 'admin'
    role = db.Column(db.String(20), nullable=False, default="user")
    first_login = db.Column(db.Boolean, default=True)
    denied_posts = db.Column(db.Integer, nullable=False, default=0)
    is_blocked = db.Column(db.Boolean, nullable=False, default=False)
    posts = db.relationship('Post',
                            back_populates='user',
                            cascade="all, delete-orphan")
    
    friends = db.relationship(
        'User',
        secondary=friendship,
        primaryjoin=(friendship.c.user_id == id),   # c - column
        secondaryjoin=(friendship.c.friend_id == id),
        backref=db.backref('friend_of', lazy='dynamic'),
        lazy='dynamic'  # This makes friends a query object, meaning we can filter the list like using LINQ, but we can't access the data directly
                        # We need to use user.friends.all()
    )

    def add_friend(self, user):
        if not self.is_friend(user):
            self.friends.append(user)

    def remove_friend(self, user):
        if self.is_friend(user):
            self.friends.remove(user)
            db.session.commit()
            return True
        return False

    def is_friend(self, user):
        return self.friends.filter(friendship.c.friend_id == user.id).count() > 0

    def __repr__(self):
        return f"<User: {self.id} -  {self.username}>"