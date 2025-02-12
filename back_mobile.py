# back_mobile.py (Backend mínimo)
from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

count = 0

@app.route('/')
def index():
    return render_template('mobile_index.html')

@socketio.on('reset_count')
def handle_reset_count():
    global count
    count = 0
    socketio.emit('update_count', {'count': count})

@socketio.on('increment_count')
def handle_increment_count():
    global count
    count += 1
    socketio.emit('update_count', {'count': count})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, ssl_context='adhoc')