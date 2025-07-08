from flask import current_app, render_template
from flask_mail import Message  
from . import mail
import threading
import logging

class EmailService:
    @staticmethod
    def send_async_email(app, msg):
        with app.app_context():
            try:
                mail.send(msg)
                logging.info(f"Email sent to {msg.recipients}")
            except Exception as e:
                logging.error(f"Error sending email: {e}")

    @staticmethod
    def send_email(recipient, subject, body, html_body=None):
        msg = Message(
            subject=subject,
            recipients=[recipient],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        msg.body = body
        if html_body:
            msg.html = html_body

        # Create and start thread
        thr = threading.Thread(
            target=EmailService.send_async_email,
            args=(current_app._get_current_object(), msg)
        )
        thr.start()