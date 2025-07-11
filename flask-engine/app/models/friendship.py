from app.database import db

# Association table for friendships
friendship = db.Table(
    'friendships',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('is_accepted', db.Boolean, default=False),
    db.CheckConstraint('user_id != friend_id', name='no_self_friendship')
    # we don't need a 'rejected' enum because we can just delete the request if it is rejected
)
