import eventlet
eventlet.monkey_patch() 

from flask import Flask, send_from_directory, request, jsonify
from flask_socketio import SocketIO, emit
import os
from time import sleep
from dotenv import load_dotenv
load_dotenv() 

from chat_environment.chat_environment import ChatRoom
from chat_environment.process_data import send_front_chatroom,process_user_input,set_chatroom,participants_emotion,stop_comment,prepare_review_plot_data,prepare_review_data,participants_review_comment
import json


app = Flask(__name__, static_folder="./frontend/build")
app_socket = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

######## settingpage ########

@app.route('/api/load-participantbot-templates', methods=["GET"])
def load_participantbot_templates():
    with open('./data/templates/personalities/all.json', 'r', encoding='utf-8') as file:
        participantbot_templates = json.load(file)
    return jsonify(participantbot_templates)


######## chatpage ########
@app.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    new_chatroom = ChatRoom.create_chatroom()
    data=request.get_json()
    set_chatroom(data,new_chatroom)
    return jsonify({"message": "データが正常に処理されました"}), 200

@app.route('/api/chatpage-init', methods=["GET"])
def chatpage_init():
    chatroom=ChatRoom.current_chatroom()
    send_data=send_front_chatroom(chatroom)
    return jsonify(send_data)


######## reviewpage ########
@app.route('/api/review-plot', methods=["GET"])
def send_review():
    cur_chatroom=ChatRoom.current_chatroom()
    prepare_review_plot_data(cur_chatroom)
    send_data=[{"name": person.name, "word_count": person.word_count, "speak_count":person.speak_count} for person in cur_chatroom.participantbots]
    return jsonify(send_data)

@app.route('/api/review-comments', methods=["GET"])
def review_comments():
    cur_chatroom=ChatRoom.current_chatroom()
    participants_review_comment(cur_chatroom)
    send_data=[{"name": p.name, "comment": p.review_comment, "id": p.person_id, "imagePath": p.image_path} for p in cur_chatroom.participantbots]
    return jsonify(send_data)

@app.route('/api/review-data', methods=["GET"])
def review_data():
    cur_chatroom=ChatRoom.current_chatroom()
    send_data=prepare_review_data(cur_chatroom)
    return jsonify(send_data)

## 全てのpathを処理してしまうので最後で
@app.route("/")
@app.route("/<path:path>")
def url_access(path=""):
    if path.startswith("static"):
        return send_from_directory(path)
    return send_from_directory(app.static_folder, "index.html")


@app_socket.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom(ChatRoom.current_chatroom())
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
