from flask import request
from flask_socketio import SocketIO
from threading import Thread
from typing import Union

from chat_setting.chat_environment import ChatRoom, ParticipantBot


# send chatroom-envrionment data to frontend
def send_front_chatroom(socket: SocketIO, chatroom: ChatRoom):
    socket.emit("chatlog", [{"name": chatdata.person.name, "content": chatdata.content, "id": chatdata.id} for chatdata in chatroom.chatlog])
    socket.emit("participants", [{"name": p.name, "persona": p.persona, "background": p.background, "id": p.person_id} for p in chatroom.participantbots])
    if chatroom.user:
        socket.emit("user", {"name": chatroom.user.name, "id": chatroom.user.person_id})

# when user input textdata
def process_user_input(data: dict, socket: SocketIO, chatroom: ChatRoom):
    if 'text' not in data or "selectedID" not in data:
        socket.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        socket.emit("log", {'content': '入力するuserがいません'})
        return 
    input_text = data['text']
    chatroom.add_chatdata(chatroom.user.person_id, input_text)
    socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
    if data["selectedID"] == 0:
        return 
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response()
        chatroom.add_chatdata(selected_person.person_id, response)
        socket.emit("chatdata", {"name": selected_person.name, "content": response})
        return
    else:
        raise NotImplementedError("personが見つかりません")
    
# initialize chatroom setting from request
def set_chatroom(chatroom: ChatRoom):
    data=request.get_json()
    chatroom.init_setting_from_dict(data)
    send_front_chatroom(chatroom)

# generate emotion for all participants
def participants_emotion(socket: Union[SocketIO,None], chatroom: ChatRoom):
    threads=[]
    def participants_emotion(socket: SocketIO, p: ParticipantBot):
        p.generate_emotion()
        if socket:
            socket.emit("participant-emotion", {"id": p.id, "emotion": p.emotion})

    for p in chatroom.participantbots:
        thread=Thread(target=participants_emotion, args=(socket,p))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()