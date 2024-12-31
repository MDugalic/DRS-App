import sys
import os

# Add the parent directory to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now import your app and other modules
from app import create_app
from app.database import db
from app.models.user import User

app = create_app()

with app.app_context():
    # Check if an admin user already exists
    existing_admin = User.query.filter_by(role='admin').first()
    if not existing_admin:
        # Create a new admin user
        admin_user = User(
            first_name="Admin",
            last_name="Admin",
            email="admin@example.com",
            username="admin",
            password="admin",
            role="admin",
            first_login=False
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"Admin user created: {admin_user}")
    else:
        print("An admin user already exists.")
