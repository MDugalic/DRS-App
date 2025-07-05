from app import create_app, socketio
import eventlet
import eventlet.wsgi
app = create_app()

if __name__ == "__main__":
    # Use socketio.run instead of app.run to enable WebSocket functionality
    socketio.run(app, debug=True, host="0.0.0.0")