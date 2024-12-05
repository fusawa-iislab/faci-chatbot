import torch
from typing import Dict,Union,List
import random
from time import sleep
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask_socketio import SocketIO

from utils.gpt_function import get_gpt
from chat_environment.prompt import response_requirement

load_dotenv()

OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")
OPENAI_ORGANIZATION_ID=os.getenv("OPENAI_ORGANIZATION_ID")
OPENAI_PROJECT=os.getenv("OPENAI_PROJECT")

openai_client = OpenAI(api_key=OPENAI_API_KEY)


class ChatRoom:
    _id_counter=0
    _current_chatroom_id=0
    _chatrooms_dict={}
    def __init__(self,title: str="",description: str=""):
        self.title=title
        self.description=description
        self.chatlog: List[ChatData]=[]
        self.chatlog_str=""
        self.summerylog=[]
        self.context_vec=torch.tensor([[0]])
        self.user=None
        self.participantbots:List[ParticipantBot]=[]
        self.persons:List[Person]=[]
        ChatRoom._id_counter+=1
        self.id=ChatRoom._id_counter
        ChatRoom._chatrooms_dict[self.id]=self

        self.STOP_COMMENT=False

    @classmethod
    def create_chatroom(cls,title: str="",description: str=""):
        new_chatroom=ChatRoom(title,description)
        ChatRoom._current_chatroom_id=new_chatroom.id
        return new_chatroom
    
    @classmethod
    def find_chatroom(cls, chatroom_id: int):
        chatroom = cls._chatrooms_dict.get(chatroom_id)
        if chatroom is None:
            raise ValueError(f"Chatroom with id {chatroom_id} not found")
        return chatroom
    
    @classmethod
    def current_chatroom(self):
        return ChatRoom.find_chatroom(ChatRoom._current_chatroom_id)

    def reset(self):
        self.chatlog = []
        self.summerylog = []
        self.context_vec = torch.tensor([[0]])
        self.user = None 
        self.participantbots = []
        self.persons = []
        self.chatlog_str=""


    def find_person(self, person_id: int):
        for p in self.persons:
            if p.person_id==person_id:
                return p
        raise NotImplementedError("idのpersonが見つかりません")
    
    def find_person_name(self, id: int):
        for p in self.persons:
            if p.id==id:
                return p.name
        raise NotImplementedError("nameのpersonが見つかりません")
        
    def init_setting_from_dict(self, data:dict):
        self.title = data.get("title", "")
        self.description = data.get("description", "")
        for person_data in data.get("personsdata", []):
            self.add_person(person_data["type"], person_data["args"])
        self.chatlog=[]
        self.summerylog=[]
        self.context_vec=torch.tensor(([0]))
        if data.get("chatlog"):
            self.load_chatlog(data["chatlog"])

    def load_chatlog(self, data: list):
        for d in data:
            self.add_chatdata(**d)

    def add_person(self,type:str,args:dict):
        if type == "Person":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            person = Person(name=args["name"],chatroom=self)
            self.persons.append(person)
        elif type == "User":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            if not self.user:
                user = User(args["name"],chatroom=self)
                self.persons.append(user)
                self.user=user
            else:
                raise ValueError("User is aliready defined")
        elif type == "ParticipantBot":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            background = args.get("background", "")
            persona = args.get("persona", "")
            other_features = args.get("features", None)
            participant = ParticipantBot(name=args["name"], background=background, persona=persona, other_features=other_features, chatroom=self)
            self.persons.append(participant)
            self.participantbots.append(participant)
        else:
            raise ValueError(f"Unknown person type: {type}")
        
    def add_chatdata(self,person_id:int,content:str):
        cd=ChatData(person_id,content,self)
        self.chatlog.append(cd)
        self.chatlog_str+=f"{cd.person.name}: {cd.content}\n"
        
    def chatlog_to_str(self,k:Union[int,None]=None):
        if k is not None:
            k = max(0, min(k, len(self.chatlog)))
            return "".join([f"{chatdata.person.name}: {chatdata.content}\n" for chatdata in self.chatlog[-k:]])
        else:
            return "".join([f"{chatdata.person.name}: {chatdata.content}\n" for chatdata in self.chatlog])


class ChatData:
    _id_counter=0
    statuses=["SUCCESS","STOPPED","ERROR"]
    def __init__(self,person_id:int,content:str,chatroom:ChatRoom,status:str="SUCCESS"):#crはChatRoomの略
        if status not in ChatData.statuses:
            raise ValueError(f"Invalid status: {status}. Must be one of {ChatData.statuses}")
        ChatData._id_counter += 1
        self.id = ChatData._id_counter
        self.person_id = person_id
        self.content = content
        self.person=chatroom.find_person(person_id)
        self.status=status
    @classmethod
    def reset(cls):
        cls._id_counter = 0
    

class Person:
    _id_counter=0
    def __init__(self, name: str, chatroom: ChatRoom):
        self.name = name
        self.comments = []
        Person._id_counter+=1
        self.person_id=Person._id_counter
        self.chatroom:ChatRoom=chatroom

    def append_comment(self, comment):
        self.comments.append(comment)


class User(Person):
    def __init__(self,name: str,chatroom: ChatRoom):
        super().__init__(name,chatroom) 

class ParticipantBot(Person):
    emotions = ["happy", "sad", "angry", "surprised", "fearful", "neutral"]
    # emotions = ["happy", "sad", "angry", "surprised", "disgusted", "fearful", "neutral"]
    def __init__(self, name, chatroom:ChatRoom, background: str="",persona:str="",other_features:Union[Dict,None]=None):
        super().__init__(name,chatroom)
        self.background=background
        self.persona=persona
        self.other_features=other_features
        self.emotion="neutral"

    def personal_data_to_str(self):
        other_features_str = ""
        if self.other_features:
            for key, value in self.other_features.items():
                other_features_str += f"    {key}: {value}\n"
        
        return (
            f"あなたは{self.name}という名前のエージェントです。\n"
            f"エージェントの特徴:\n"
            f"    背景: {self.background},\n"
            f"    属性: {self.persona}\n"
            f"    直前の感情: {self.emotion}\n"
            f"{other_features_str}"
            f"##########################################\n"
        )
    
    def create_input_prompt(self):
        system = ""
        user = ""
        system += self.personal_data_to_str()
        system += response_requirement

        user += "これまでの会話の流れ\n"
        user += self.chatroom.chatlog_str
        user += "######################################\n"
        user += "これまでの流れに沿うように応答を生成してください"
        return user, system
            
    def generate_response(self):
        user, system = self.create_input_prompt()
        response = get_gpt(user, system, temperature=1, max_tokens=1000)
        return response
    
    def generate_response_streaming(self, socket: Union[SocketIO,None]=None, socket_name: Union[str,None]=None):

        def openai_streaming(prompt: str, system: str, temperature: float = 1, max_tokens: int = 100, socket: Union[SocketIO,None] = None, socket_name: Union[str,None]=None):
            data = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": f"{system}"},
                    {"role": "user", "content": f"{prompt}"}
                ],
                "temperature": temperature,
                "stream": True
            }
            if max_tokens > 0:
                data["max_tokens"] = max_tokens

            output = ""
            stream = openai_client.chat.completions.create(**data)
            if socket:
                socket.emit(socket_name, "__start-of-stream")
            for chunk in stream:
                if (chunk.choices[0].delta.content is not None) and (not self.chatroom.STOP_COMMENT):
                    ele = chunk.choices[0].delta.content
                    if socket:
                        socket.emit(socket_name, ele)
                        # print(ele)
                    output += ele
                else:
                    break
                sleep(0.1)

            if socket:
                socket.emit(socket_name, "__end-of-stream")
            if self.chatroom.STOP_COMMENT:
                self.chatroom.STOP_COMMENT=False
            return output
        
        user, system = self.create_input_prompt()
        response = openai_streaming(user, system, temperature=1, max_tokens=1000, socket=socket,socket_name=socket_name)
        return response
    
    def generate_emotion(self):
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.personal_data_to_str()
            system +=f"感情の選択肢: {str(self.emotions)}\n"
            system +=f"このエージェントの次の感情を選択肢の中から選択し、感情の名前のみ文字列で返してください\n"

            user += "直近の会話の流れ\n"
            user += self.chatroom.chatlog_to_str(5)
            user += "######################################\n"
            user += "これまでの流れにからどのような感情を生成するか選択してください\n"
            return user, system
        # user, system = create_input_prompt(self)
        # emotion= get_gpt(user, system, temperature=0.5, max_tokens=100)
        emotion=random.choice(self.emotions)
        self.emotion=emotion


    def raise_hand_to_speak(self):

        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.personal_data_to_str()
            system += "あなたは呼びかけに対して発言したいかどうかをTかFのどちらかで答えてください\n"

            user += "直近の会話の流れ\n"
            user += self.chatroom.chatlog_to_str()
            user += "######################################\n"
            user += "これまでの流れにから次の発言を生成してください\n"
            return user, system
        
        user, system = create_input_prompt(self)
        response = get_gpt(user, system, temperature=1, max_tokens=10)
        if response.lower() == "t":
            return True
        elif response.lower() == "f":
            return False
        else:
            raise ValueError("Invalid response. Must be either 'T' or 'F'")
        

