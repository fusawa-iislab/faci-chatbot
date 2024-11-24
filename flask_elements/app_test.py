from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
from group_setting.chatroom import ChatRoom, chatroom

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

app_test = Flask(__name__)
CORS(app_test, resources={r"/*": {"origins": FRONTEND_PATH}})
app_socket_test = SocketIO(app_test, cors_allowed_origins=FRONTEND_PATH, async_mode="eventlet")


@app_test.route('/')
def home():
    return "test"

def send_front_chatroom():
    app_socket_test.emit("chatlog", [{"name": chatdata.person.name, "content": chatdata.content, "id": chatdata.id} for chatdata in chatroom.chatlog])
    app_socket_test.emit("participants", [{"name": p.name, "persona": p.persona, "background": p.background, "id": p.person_id} for p in chatroom.participantbots])
    if chatroom.user:
        app_socket_test.emit("user", {"name": chatroom.user.name, "id": chatroom.user.person_id})

@app_socket_test.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom()

@app_socket_test.on("user-input")
def receive_chat_input(data):
    if 'text' not in data or "selectedID" not in data:
        app_socket_test.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        app_socket_test.emit("log", {'content': '入力するuserがいません'})
        return 
    input_text = data['text']
    chatroom.add_chatdata(chatroom.user.person_id, input_text)
    app_socket_test.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
    if data["selectedID"] == 0:
        return 
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response(chatroom)
        chatroom.add_chatdata(selected_person.person_id, response)
        app_socket_test.emit("chatdata", {"name": selected_person.name, "content": response})
    else:
        raise NotImplementedError("personが見つかりません")

@app_test.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    chatroom.reset()
    data = request.get_json()
    chatroom.init_setting_from_dict(data)
    send_front_chatroom()
    return jsonify({"message": "データが正常に処理されました"}), 200


if __name__ == '__main__':
    app_socket_test.run(app_test, host="127.0.0.1", port=5050, debug=True)
