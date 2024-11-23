from flask import Flask, send_from_directory
from flask_elements import app, app_socket


from flask import request, jsonify
from flask_socketio import emit
import os
from dotenv import load_dotenv
from group_setting.chatroom import ChatRoom, chatroom
import sys
import json

load_dotenv()


# initialize setting
chatroom.reset()

# ルートにアクセスしたときに、ビルドされたindex.htmlを返す
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# その他の静的ファイル（JS、CSSなど）を提供
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


def send_front_chatroom():
    app_socket.emit("chatlog", [{"name":chatdata.person.name,"content": chatdata.content,"id":chatdata.id} for chatdata in chatroom.chatlog])
    app_socket.emit("participants", [{"name": p.name, "persona": p.persona, "background": p.background, "id": p.person_id} for p in chatroom.participantbots])
    if chatroom.user:
        app_socket.emit("user", {"name": chatroom.user.name, "id": chatroom.user.person_id})

@app_socket.on('connect')
def on_connect():
    print("クライアントが接続しました")
    emit('log', {"content": "connected to backend"})
    send_front_chatroom()

@app_socket.on("user-input")
def receive_chat_input(data):
    if 'text' not in data or "selectedID" not in data:
        app_socket.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        app_socket.emit("log", {'content': '入力するuserがいません'})
        return 
    input_text = data['text']
    chatroom.add_chatdata(chatroom.user.person_id, input_text)
    app_socket.emit("chatdata",{"name": chatroom.user.name, "content": input_text})
    if data["selectedID"] == 0:
        return jsonify({"message": "データが正常に処理されました"}), 200
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response(chatroom)
        chatroom.add_chatdata(selected_person.person_id, response)
        app_socket.emit("chatdata",{"name": selected_person.name, "content": response})
    else:
        raise NotImplementedError("personが見つかりません")
    return jsonify({"message": "データが正常に処理されました"}), 200

@app.route('/api/init_setting', methods=["POST"])
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
    app_socket.run(app, host="127.0.0.1", port=5050, debug=True)


