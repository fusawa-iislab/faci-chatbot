import eventlet
eventlet.monkey_patch() 

from flask import Flask, send_from_directory, request, jsonify
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
from time import sleep

from chat_setting.chat_environment import ChatRoom
from chat_setting.process_data import send_front_chatroom,process_user_input,set_chatroom,participants_emotion,stop_comment

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

app = Flask(__name__, static_folder="./frontend/build")
app_socket = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


@app.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    new_chatroom = ChatRoom.create_chatroom()
    app_socket.start_background_task(set_chatroom, new_chatroom)
    return jsonify({"message": "データが正常に処理されました"}), 200


## 全てのpathを処理してしまうので最後で
@app.route("/")
@app.route("/<path:path>")
def url_access(path=""):
    if path.startswith("static"):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


@app_socket.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom(app_socket, ChatRoom.current_chatroom())
    return


def test(data,app_socket,chatroom):
    process_user_input(data, app_socket, chatroom)
    participants_emotion(app_socket, chatroom)

@app_socket.on("user-input")
def receive_chat_input(data):
    app_socket.start_background_task(test, data, app_socket, ChatRoom.current_chatroom())
    return

#userがstopを押した時
@app_socket.on("stop-comment")
def stop_comment_sys(_):
    app_socket.start_background_task(stop_comment, ChatRoom.current_chatroom())






if __name__ == '__main__':
    app_socket.run(app, host="127.0.0.1", port=5050, debug=True)
