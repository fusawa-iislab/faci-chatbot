from flask import Flask, send_from_directory, request, jsonify
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
from group_setting.chatroom import ChatRoom,chatroom

load_dotenv()

FRONTEND_PATH = os.getenv("FRONTEND_PATH")

app = Flask(__name__, static_folder="../frontend/build", static_url_path="")
app_socket = SocketIO(app, cors_allowed_origins="*")



# ルートにアクセスしたときに、ビルドされたindex.htmlを返す
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# その他の静的ファイル（JS、CSSなど）を提供
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

def send_front_chatroom():
    app_socket.emit("chatlog", [{"name": chatdata.person.name, "content": chatdata.content, "id": chatdata.id} for chatdata in chatroom.chatlog])
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
    app_socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
    if data["selectedID"] == 0:
        return
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response(chatroom)
        chatroom.add_chatdata(selected_person.person_id, response)
        app_socket.emit("chatdata", {"name": selected_person.name, "content": response})
    else:
        raise NotImplementedError("personが見つかりません")

@app.route('/api/init_setting', methods=["POST"])
def initialize_setting():
    chatroom.reset()
    data = request.get_json()
    chatroom.init_setting_from_dict(data)
    send_front_chatroom()
    return jsonify({"message": "データが正常に処理されました"}), 200


if __name__ == '__main__':
    app_socket.run(app, host="127.0.0.1", port=5050, debug=True)
