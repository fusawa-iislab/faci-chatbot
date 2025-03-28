from typing import Dict,Union,List
import random
from time import sleep
from openai import OpenAI
import os
from flask_socketio import SocketIO
from dotenv import load_dotenv
load_dotenv() 

from utils.gpt_function import get_gpt
from utils.search_files import get_template_image_paths


OPENAI_API_KEY=os.environ.get("OPENAI_API_KEY")
OPENAI_ORGANIZATION_ID=os.environ.get("OPENAI_ORGANIZATION_ID")
OPENAI_PROJECT=os.environ.get("OPENAI_PROJECT")

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
        # self.summerylog=[]
        self.user=None
        self.participantbots:List[ParticipantBot]=[]
        self.persons:List[Person]=[]
        # self.limit_time = {"munite": 0, "second": 0}
        ChatRoom._id_counter+=1
        self.id=ChatRoom._id_counter
        ChatRoom._chatrooms_dict[self.id]=self

        self.STOP_COMMENT=False
        self.situational_prompt=""


    @classmethod
    def create_chatroom(cls,title: str="",description: str=""):
        new_chatroom=ChatRoom(title,description)
        ChatRoom._current_chatroom_id=new_chatroom.id
        return new_chatroom
    
    @classmethod
    def find_chatroom(cls, chatroom_id: int) -> 'ChatRoom':
        chatroom = cls._chatrooms_dict.get(chatroom_id)
        if chatroom is None:
            raise ValueError(f"Chatroom with id {chatroom_id} not found")
        return chatroom
    
    @classmethod
    def current_chatroom(self)->'ChatRoom':
        return ChatRoom.find_chatroom(ChatRoom._current_chatroom_id)

    def reset(self):
        self.chatlog = []
        self.user = None 
        self.participantbots = []
        self.persons = []
        self.chatlog_str=""
        self.limit_time = None
        self.STOP_COMMENT=False


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
        # self.summerylog=[]
        # if data.get("time"):
        #     munite = data["time"]["munite"]
        #     second = data["time"]["second"]
        #     self.limit_time = {"munite": munite, "second": second}
        if data.get("chatlog"):
            self.load_chatlog(data["chatlog"])

        # ここは直すこと
        template_images=get_template_image_paths()
        selected_template_images = random.sample(template_images, len(self.participantbots))
        for p, image_path in zip(self.participantbots, selected_template_images):
            p.image_path = image_path
        self.situational_prompt=self.create_situational_prompt()


    def load_chatlog(self, data: list):
        for d in data:
            self.add_chatdata(**d)

    def add_person(self,type:str,args:dict):
        # Personの時
        if type == "Person":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            person = Person(name=args["name"],chatroom=self)
            self.persons.append(person)
        # Userの時
        elif type == "User":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            if not self.user:
                user = User(args["name"],chatroom=self)
                self.persons.append(user)
                self.user=user
            else:
                raise ValueError("User is aliready defined")
        # ParticipantBotの時
        elif type == "ParticipantBot":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            persona = args.get("persona", "")
            image_path = args.get("image_path", None)
            participant = ParticipantBot(name=args["name"], persona=persona, image_path=image_path, chatroom=self)
            self.persons.append(participant)
            self.participantbots.append(participant)
        else:
            raise ValueError(f"Unknown person type: {type}")
        
    def add_chatdata(self,person_id:int,content:str,status:str="SUCCESS"):
        cd=ChatData(person_id,content,self,status)
        self.chatlog.append(cd)
        self.chatlog_str+=f"{cd.person.name}: {cd.content}\n"
        return cd.id
    
        
    def chatlog_to_str(self,k:Union[int,None]=None):
        if k is not None:
            k = max(0, min(k, len(self.chatlog)))
            return "".join([f"{chatdata.person.name}: {chatdata.content}\n" for chatdata in self.chatlog[-k:]])
        else:
            return "".join([f"{chatdata.person.name}: {chatdata.content}\n" for chatdata in self.chatlog])
        
    def create_situational_prompt(self):
        output=""
        output+=f"ここでは以下の内容に関する集団での会話が行われています\n"
        output+=f"タイトル: {self.title}\n"
        if self.description:
            output+=f"詳細:{self.description}\n"
        if not self.user:
            raise ValueError("User is not defined")
        if not self.participantbots:
            raise ValueError("ParticipantBots are not defined")
        
        output+=f"会話には{self.user.name}、{'、'.join(p.name for p in self.participantbots)}が参加しており、"
        output+=f"{self.user.name}のみが話を回す役割をします\n"
        output+=f"\n"
        return output


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
        self.word_count=0
        self.speak_count=0
        self.stop_count=0

    def append_comment(self, comment):
        self.comments.append(comment)


class User(Person):
    def __init__(self,name: str,chatroom: ChatRoom):
        super().__init__(name,chatroom) 

class ParticipantBot(Person):
    emotions = ["happy", "sad", "angry", "surprised", "fearful", "neutral"]
    def __init__(self, name, chatroom:ChatRoom,persona:str="",image_path:str=None):
        super().__init__(name,chatroom)
        self.persona=persona
        self.image_path=image_path
        self.emotion="neutral"
        self.review_comment=""

    def personal_data_to_str(self):

        return (
            f"{self.name}の特徴:\n"
            f"{self.persona}\n\n"
        )

    
            
    def generate_response(self):
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.chatroom.situational_prompt

            system += "これまでの会話の流れ\n"
            system += self.chatroom.chatlog_str
            system += "\n"

            system += self.personal_data_to_str()
            user += f"{self.name}は、{self.chatroom.user.name}に話をふられました\n"
            user += f"{self.name}としてこれまでの流れに沿うように応答してください"
            return user, system
        user, system = create_input_prompt(self)
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

            return_status = "SUCCESS"
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
                return_status = "STOPPED"
            return output, return_status
        
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.chatroom.situational_prompt

            system += "これまでの会話の流れ\n"
            system += self.chatroom.chatlog_str
            system += "\n"

            system += self.personal_data_to_str()
            user += f"{self.name}は、{self.chatroom.user.name}に話をふられました。\n"
            user += f"{self.name}としてこれまでの流れに沿うように応答してください。"
            return user, system
        
        system = create_input_prompt(self)
        response = openai_streaming("", system, temperature=1, max_tokens=1000, socket=socket,socket_name=socket_name)
        return response
    
    def generate_emotion(self):

        def create_input_prompt(self):
            user = ""
            system = ""
            system += self.chatroom.situational_prompt

            system += "これまでの会話の流れ\n"
            system += self.chatroom.chatlog_str
            system += "\n"

            system += self.personal_data_to_str()
            user += f"{self.name}として現在の感情を{self.emotions}から選び、その文字列のみを返してください\n"
            return user, system
        

        user, system = create_input_prompt(self)
        emotion= get_gpt(user, system, temperature=0.5, max_tokens=100)
        # emotion = random.choice(self.emotions)
        self.emotion=emotion
        self.emotions.append(emotion)
        return
    
    def generate_review_comment(self):
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.chatroom.situational_prompt

            system += "これまでの会話の流れ\n"
            system += self.chatroom.chatlog_str
            system += "\n"

            system += self.personal_data_to_str()
            user += f"{self.name}としてこれまでの会話の感想を生成してください\n"
            return user,system
        
        user,system = create_input_prompt(self)
        response = get_gpt(user, system, temperature=1, max_tokens=1000)
        self.review_comment = response
        return


    def raise_hand_to_speak(self):

        def create_input_prompt(self):
            user = ""
            system = ""
            system += self.chatroom.situational_prompt

            system += "これまでの会話の流れ\n"
            system += self.chatroom.chatlog_str
            system += "\n"

            system += self.personal_data_to_str()
            user += f"{self.name}として、{self.chatroom.user.name}の呼びかけに対して発言したいかどうかをTかFのどちらかで答えてください\n"
            return user, system
        
        user,system = create_input_prompt(self)
        response = get_gpt(user, system, temperature=1, max_tokens=5)
        if response.lower() == "t":
            return True
        elif response.lower() == "f":
            return False
        else:
            raise ValueError("Invalid response. Must be either 'T' or 'F'")
        

