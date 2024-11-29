from flask import current_app
from flask_mail import Message  
from . import mail  

class EmailService:
    @staticmethod
    #method for sending emails
    def send_email(recipient, subject, body):
        msg = Message(subject=subject, recipients=[recipient], sender=current_app.config['MAIL_DEFAULT_SENDER'])
        msg.body = body

        try:
            mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")
