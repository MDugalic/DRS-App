from app.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
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

    #same as public override ToString()
    #__str__ has the same function, but this is preferred for development
    def __repr__(self):
        return f"<User: {self.username}>"
