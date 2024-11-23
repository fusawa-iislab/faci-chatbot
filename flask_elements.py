from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv

load_dotenv()

# start用

FRONTEND_PATH=os.getenv("FRONTEND_PATH")
backend = Flask(__name__)
CORS(backend, resources={r"/*": {"origins": FRONTEND_PATH}})

backend_socket = SocketIO(backend, cors_allowed_origins=FRONTEND_PATH,async_mode="eventlet")

# build用

app = Flask(__name__, static_folder="frontend/build", static_url_path="")

app_socket = SocketIO(app, cors_allowed_origins="*")


