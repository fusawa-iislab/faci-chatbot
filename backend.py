from flask import request, jsonify
from flask_socketio import emit
import os
from dotenv import load_dotenv
import asyncio
import torch
from summery import create_summmery
from backend.utils.gpt_function import get_gpt
from generate_response import generate_response
from dpr import register_context_vec
from flask_elements import backend, backend_socket
from group_setting import Condition


FRONTEND_PATH=os.getenv("FRONTEND_PATH")

# initialize setting

#################### テスト用 ###################################################
@backend.route('/')
def home():
    return "test"

def send_front_data():
    backend_socket.emit("participants", {"data": [{"name": p.name, "persona": p.persona,"id": p.id} for p in Participant._dict.values()]})
    backend_socket.emit("chatlog",{"data":chat_cond.chatlog})

########################################################################################


def register_chatdata(p: Person,content:str):
    global context_embeddings
    chatdata={"name":p.name,"content":content}
    p.append_comment(content)
    chat_cond.chatlog.append(chatdata)
    if p.name!="user":
        summery=create_summmery(chatdata)
        chat_cond.summerylog.append(summery)
        context_embeddings=register_context_vec(summery,context_embeddings)
    backend_socket.emit("chatdata",chatdata)

    load_dotenv()

    FRONTEND_PATH=os.getenv("FRONTEND_PATH")

    # initialize setting

    #################### テスト用 ###################################################
    @backend.route('/')
    def home():
        return "test"

    def send_front_data():
        backend_socket.emit("participants", {"data": [{"name": p.name, "persona": p.persona,"id": p.id} for p in Participant._dict.values()]})
        backend_socket.emit("chatlog",{"data":chat_cond.chatlog})

    ########################################################################################


    def register_chatdata(p: Person,content:str):
        global context_embeddings
        chatdata={"name":p.name,"content":content}
        p.append_comment(content)
        chat_cond.chatlog.append(chatdata)
        if p.name!="user":
            summery=create_summmery(chatdata)
            chat_cond.summerylog.append(summery)
            context_embeddings=register_context_vec(summery,context_embeddings)
        backend_socket.emit("chatdata",chatdata)


    @backend_socket.on('connect')
    def on_connect():
        print("クライアントが接続しました")
        emit('log', {"content": "connected to backend"})
        emit("participants", {"data": [{"name": p.name, "persona": p.persona,"id": p.id} for p in Participant._dict.values()]})
        emit("chatlog",{"data":chat_cond.chatlog})

    def reply_from_participant(p: Participant, user_input):
        response=generate_response(p=p,input_data=user_input,context_embeddings=context_embeddings,chatlog=chat_log,summery_log=summery_log,participants=Participant._dict.values())
        register_chatdata(p,response)


    @backend_socket.on("user-input")
    def receive_chat_input(data):
        if ('text' not in data) :
            backend_socket.emit("log",{'content':'入力が正しくありません'})
            return
        input_text = data['text']
        register_chatdata(user,input_text)
        selected_participant=Participant._dict.get(1)
        if selected_participant==0:
            pass
        elif selected_participant:
            reply_from_participant(selected_participant,{"name":"user", "content": input_text})
        else:
            backend_socket.emit("log",{'content':'選択したparticipantは存在しません'})
            return
        backend_socket.emit("log",{'content':'入力処理が完了しました'})
        return

    @backend.route('/api/init_setting',methods=["POST"])
    def initialize_setting():
        global TITLE,DESCRIPTION
        chat_log=[]
        summery_log=[]
        data = request.get_json()  # JSONデータの場合
        print("受け取ったデータ:", data)
        TITLE=data["title"]
        DESCRIPTION=data["description"]
        Participant.reset_id_counter()
        Participant._dict={}
        for p in data["participants"]:
            Participant(p["name"],p["persona"],p["role"])
        # テスト用
        send_front_data()
        return jsonify({"message": "データが正常に処理されました"}), 200

    #テスト用
    @backend.route('/api/test_setting',methods=["POST"])
    def test_setting():
        global TITLE,DESCRIPTION
        TITLE="気候変動について"
        DESCRIPTION=""
        Participant.reset_id_counter()
        Participant._dict={}
        Participant("A","優しい","議論の参加者、賛成する人")
        Participant("B","厳しい","議論の参加者、反対する人")
        Participant("C","中立","議論の参加者、どっちつかず")

        send_front_data()
        return jsonify({"message": "データが正常に処理されました"}), 200

    if __name__ == '__main__':
        backend_socket.run(backend, host="127.0.0.1",port=5050, debug=True)