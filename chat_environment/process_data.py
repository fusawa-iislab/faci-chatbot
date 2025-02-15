from flask_socketio import SocketIO
from threading import Thread
from typing import Union
from time import sleep

from chat_environment.chat_environment import ChatRoom, ChatData, ParticipantBot
import random


# initialize chatroom setting from request
def set_chatroom(data:Union[list,dict],chatroom: ChatRoom):
    chatroom.init_setting_from_dict(data)

    # check if names are duplicated
    names=[p.name for p in chatroom.participantbots]
    if len(names)!=len(set(names)):
        raise ValueError("名前が重複しています")    
    return

# send chatroom-envrionment data to frontend
def send_front_chatroom(chatroom: ChatRoom):
    send_data={
        "chatlog": [{"name": chatdata.person.name, "content": chatdata.content, "id": chatdata.id, "status": chatdata.status} for chatdata in chatroom.chatlog],
        "participants": [{"name": p.name, "persona": p.persona,  "id": p.person_id, "imagePath": p.image_path} for p in chatroom.participantbots],
        "situation": {"title": chatroom.title, "description": chatroom.description},
        "user": {"name": chatroom.user.name, "id": chatroom.user.person_id} if chatroom.user else None,
    }
    return send_data


def stop_comment(chatroom: ChatRoom):
    chatroom.STOP_COMMENT=True
    sleep(0.1)
    if chatroom.STOP_COMMENT:
        chatroom.STOP_COMMENT=False
    return

# when user input textdata
def process_user_input(data: dict, socket: SocketIO, chatroom: ChatRoom)->None:
    data_elements = ["text", "selectedID", "askForComment"]
    if not all([e in data for e in data_elements]):
        socket.emit("log", {'content': '入力が正しくありません'})
        return
    if not chatroom.user:
        socket.emit("log", {'content': '入力するuserがいません'})
        return
    input_text = data['text']
    if data["askForComment"]:
        chatroom.add_chatdata(chatroom.user.person_id, input_text, status="SUCCESS")
        socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text})
        participants_raise_hands_to_speak(socket, chatroom)
        return
    else:
        for p in chatroom.participantbots:
            if socket:
                socket.emit(f"raise-hand-{p.person_id}", False)
    cd_id=chatroom.add_chatdata(chatroom.user.person_id, input_text, status="SUCCESS")
    socket.emit("chatdata", {"name": chatroom.user.name, "content": input_text, "status": "SUCCESS", "id": cd_id})
    if not data["selectedID"]:
        return 
    selected_person = chatroom.find_person(data["selectedID"])
    if selected_person:
        response, return_status = selected_person.generate_response_streaming(socket,f"comment-{selected_person.person_id}")
        cd_id=chatroom.add_chatdata(selected_person.person_id, response, return_status)
        socket.emit("chatdata", {"name": selected_person.name, "content": response, "status": return_status, "id": cd_id})
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

def participants_review_comment(chatroom: ChatRoom):
    threads=[]
    def participant_generate_review_comment(p: ParticipantBot):
        p.generate_review_comment()
    participants = chatroom.participantbots
    if len(participants) > 4:
        participants = random.sample(participants, 4)
    for p in participants:
        thread=Thread(target=participant_generate_review_comment, args=(p,))
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()
    return

def prepare_review_plot_data(chatroom: ChatRoom):
    for person in chatroom.persons:
        person.word_count=0
        person.speak_count=0
        person.stop_count=0
    chatdatas:ChatData=chatroom.chatlog
    for chatdata in chatdatas:
        person=chatroom.find_person(chatdata.person_id)
        person.word_count+=len(chatdata.content)
        person.speak_count+=1
        if chatdata.status=="STOPPED":
            person.stop_count+=1
    return

def prepare_review_data(chatroom: ChatRoom):
    data = {
        "chatdatas":[{"name":c.person.name,"content":c.content, "id":c.id, "status": c.status} for c in chatroom.chatlog],
        "title": chatroom.title,
        "description": chatroom.description,
        "participants": [{"name": p.name, "persona": p.persona, "id": p.person_id, "imagePath": p.image_path} for p in chatroom.participantbots],
    }
    return data
