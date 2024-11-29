from app.database import db

# Association table for friendships
friendship = db.Table(
    'friendships',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('acceepted', db.Boolean, default=False)
)
