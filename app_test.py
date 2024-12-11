import eventlet
eventlet.monkey_patch() 

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv

from utils.misc import create_templates_dict_from_json
from chat_environment.chat_environment import ChatRoom
from chat_environment.process_data import send_front_chatroom, process_user_input,set_chatroom,participants_emotion,stop_comment

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

app_test = Flask(__name__)
CORS(app_test, resources={r"/*": {"origins": FRONTEND_PATH}})
app_socket_test = SocketIO(app_test, cors_allowed_origins=FRONTEND_PATH, async_mode="eventlet")


@app_test.route('/')
def home():
    return "test"

@app_test.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    new_chatroom = ChatRoom.create_chatroom()
    data=request.get_json()
    app_socket_test.start_background_task(set_chatroom, data, new_chatroom)
    return jsonify({"message": "データが正常に処理されました"}), 200

@app_test.route('/api/load_templates', methods=["GET"])
def load_templates():
    templates = create_templates_dict_from_json("./data/templates")
    return jsonify(templates)


@app_socket_test.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom(app_socket_test, ChatRoom.current_chatroom())
    return

@app_socket_test.on("user-input")
def receive_chat_input(data):
    def test(data,app_socket,chatroom):
        process_user_input(data, app_socket, chatroom)
        participants_emotion(app_socket, chatroom)
    app_socket_test.start_background_task(test, data, app_socket_test, ChatRoom.current_chatroom())

#userがstopを押した時
@app_socket_test.on("stop-comment")
def stop_comment_sys(_):
    app_socket_test.start_background_task(stop_comment, ChatRoom.current_chatroom())




if __name__ == '__main__':
    app_socket_test.run(app_test, host="127.0.0.1", port=5050, debug=True)
