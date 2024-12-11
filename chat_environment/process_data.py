from flask import request
from flask_socketio import SocketIO
from threading import Thread
from typing import Union
from dotenv import load_dotenv
from time import sleep

from chat_environment.chat_environment import ChatRoom, ParticipantBot


load_dotenv()

# initialize chatroom setting from request
def set_chatroom(data:Union[list,dict],chatroom: ChatRoom):
    chatroom.init_setting_from_dict(data)
    send_front_chatroom(chatroom)
    return

# send chatroom-envrionment data to frontend
def send_front_chatroom(socket: SocketIO, chatroom: ChatRoom):
    socket.emit("chatlog", [{"name": chatdata.person.name, "content": chatdata.content, "id": chatdata.id} for chatdata in chatroom.chatlog])
    socket.emit("participants", [{"name": p.name, "persona": p.persona,  "id": p.person_id} for p in chatroom.participantbots])
    if chatroom.user:
        socket.emit("user", {"name": chatroom.user.name, "id": chatroom.user.person_id})

def stop_comment(chatroom: ChatRoom):
    chatroom.STOP_COMMENT=True
    sleep(0.1)
    if chatroom.STOP_COMMENT:
        chatroom.STOP_COMMENT=False
    return

# when user input textdata
def process_user_input(data: dict, socket: SocketIO, chatroom: ChatRoom)->None:
    if ('text' not in data) or ("selectedID" not in data) or ("askForComment" not in data):
        socket.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        socket.emit("log", {'content': '入力するuserがいません'})
        return 
    
    input_text = data['text']

    if data["askForComment"]:
        chatroom.add_chatdata(chatroom.user.person_id, input_text)
        socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
        participants_raise_hands_to_speak(socket, chatroom)
        return
    else:
        for p in chatroom.participantbots:
            if socket:
                socket.emit(f"raise-hand-{p.person_id}", False)
    chatroom.add_chatdata(chatroom.user.person_id, input_text)
    socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
    if not data["selectedID"]:
        return 
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response = selected_person.generate_response_streaming(socket,f"comment-{selected_person.person_id}")
        chatroom.add_chatdata(selected_person.person_id, response)
        socket.emit("chatdata", {"name": selected_person.name, "content": response})
        return
    else:
        raise NotImplementedError("personが見つかりません")
    

# generate emotion for all participants
def participants_emotion(socket: Union[SocketIO,None], chatroom: ChatRoom):
    threads=[]
    def participant_emotion(socket: SocketIO, p: ParticipantBot):
        p.generate_emotion()
        if socket:
            socket.emit(f"emotion-{p.person_id}", p.emotion)
    for p in chatroom.participantbots:
        thread=Thread(target=participant_emotion, args=(socket,p))
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()

def participants_raise_hands_to_speak(socket: Union[SocketIO,None], chatroom: ChatRoom):
    threads=[]
    def participant_raise_hand(socket: SocketIO, p: ParticipantBot):
        will=p.raise_hand_to_speak()
        if socket:
            socket.emit(f"raise-hand-{p.person_id}", will)
    for p in chatroom.participantbots:
        thread=Thread(target=participant_raise_hand, args=(socket,p))
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()
    return
