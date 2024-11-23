from flask import request, jsonify
from flask_socketio import emit
import os
from dotenv import load_dotenv
from flask_elements import backend, backend_socket
from group_setting.chatroom import ChatRoom, chatroom
import sys
import json

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

# initialize setting
chatroom.reset()

@backend.route('/')
def home():
    return "test"

def send_front_chatroom():
    backend_socket.emit("chatlog", [{"name":chatdata.person.name,"content": chatdata.content,"id":chatdata.id} for chatdata in chatroom.chatlog])
    backend_socket.emit("participants", [{"name": p.name, "persona": p.persona, "background": p.background, "id": p.person_id} for p in chatroom.participantbots])
    if chatroom.user:
        backend_socket.emit("user", {"name": chatroom.user.name, "id": chatroom.user.person_id})

@backend_socket.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom()

@backend_socket.on("user-input")
def receive_chat_input(data):
    if 'text' not in data or "selectedID" not in data:
        backend_socket.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        backend_socket.emit("log", {'content': '入力するuserがいません'})
        return 
    input_text = data['text']
    chatroom.add_chatdata(chatroom.user.person_id, input_text)
    backend_socket.emit("chatdata",{"name": chatroom.user.name, "content": input_text})
    if data["selectedID"] == 0:
        return jsonify({"message": "データが正常に処理されました"}), 200
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response(chatroom)
        chatroom.add_chatdata(selected_person.person_id, response)
        backend_socket.emit("chatdata",{"name": selected_person.name, "content": response})
    else:
        raise NotImplementedError("personが見つかりません")
    return jsonify({"message": "データが正常に処理されました"}), 200

@backend.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    chatroom.reset()
    data = request.get_json()
    chatroom.init_setting_from_dict(data)
    send_front_chatroom()
    return jsonify({"message": "データが正常に処理されました"}), 200

if len(sys.argv) < 2:
    pass
elif len(sys.argv) == 2:
    json_file_path = sys.argv[1]
    if not os.path.exists(json_file_path):
        print(f"指定されたファイルが存在しません: {json_file_path}")
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        chatroom.init_setting_from_dict(data)
        send_front_chatroom()

if __name__ == '__main__':
    backend_socket.run(backend, host="127.0.0.1", port=5050, debug=True)
