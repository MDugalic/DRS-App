from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins=
    [
        "http://localhost:3000",
        "https://drs-frontend-7rjq.onrender.com"
    ]
)