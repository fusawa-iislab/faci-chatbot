from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
from chat_setting.chat_environment import ChatRoom
from chat_setting.process_data import send_front_chatroom, process_user_input,set_chatroom,participants_emotion

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

app_test = Flask(__name__)
CORS(app_test, resources={r"/*": {"origins": FRONTEND_PATH}})
app_socket_test = SocketIO(app_test, cors_allowed_origins=FRONTEND_PATH, async_mode="eventlet")


@app_test.route('/')
def home():
    return "test"


@app_socket_test.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom(app_socket_test, ChatRoom.current_chatroom())

@app_socket_test.on("user-input")
def receive_chat_input(data):
    process_user_input(data, app_socket_test, ChatRoom.current_chatroom())
    participants_emotion(app_socket_test, ChatRoom.current_chatroom())

@app_test.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    new_chatroom = ChatRoom.create_chatroom()
    set_chatroom(new_chatroom)
    return jsonify({"message": "データが正常に処理されました"}), 200


if __name__ == '__main__':
    app_socket_test.run(app_test, host="127.0.0.1", port=5050, debug=True)
