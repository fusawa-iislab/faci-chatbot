from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_PATH=os.getenv("FRONTEND_PATH")
backend = Flask(__name__)
CORS(backend, resources={r"/*": {"origins": FRONTEND_PATH}})

backend_socket = SocketIO(backend, cors_allowed_origins=FRONTEND_PATH,async_mode="eventlet")