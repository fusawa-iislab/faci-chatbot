import torch
from utils.gpt_function import get_gpt
from typing import Dict


class ChatRoom:
    _id_counter=0
    _current_chatroom_id=0
    _chatrooms_dict={}
    def __init__(self,title: str="",description: str=""):
        self.title=title
        self.description=description
        self.chatlog=[]
        self.chatlog_str=""
        self.summerylog=[]
        self.context_vec=torch.tensor([[0]])
        self.user=None
        self.participantbots=[]
        self.persons=[]
        ChatRoom._id_counter+=1
        self.id=ChatRoom._id_counter
        ChatRoom._chatrooms_dict[self.id]=self

    @classmethod
    def create_chatroom(cls,title: str="",description: str=""):
        new_chatroom=ChatRoom(title,description)
        ChatRoom._current_chatroom_id=ChatRoom._id_counter
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

    def print_attributes(self):
        for attr_name in ["title", "description", "chatlog", "summerylog", "context_vec", "user", "participants"]:
            print(f"{attr_name.capitalize()}: {getattr(self, attr_name)}")

    def find_person(self, person_id: int):
        for p in self.persons:
            if p.person_id==person_id:
                return p
        raise NotImplementedError("idのpersonが見つかりません")
        
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
            participant = ParticipantBot(name=args["name"], background=background, persona=persona,chatroom=self)
            self.persons.append(participant)
            self.participantbots.append(participant)
        else:
            raise ValueError(f"Unknown person type: {type}")
        
    def add_chatdata(self,person_id:int,content:str):
        cd=ChatData(person_id,content,self)
        self.chatlog.append(cd)
        self.chatlog_str+=f"{cd.person.name}: {cd.content}\n"
        
    def chatlog_to_str(self):
        self.chatlog_str = ""
        for _, chatdata in self.chatlog:
            person_name = chatdata.person.name
            content = chatdata.content
            self.chatlog_str += f"{person_name}: {content}\n"

    def participants_emotions(self):
        emotions = {}

class ChatData:
    _id_counter=0
    def __init__(self,person_id:int,content:str,chatroom:ChatRoom):#crはChatRoomの略
        ChatData._id_counter += 1
        self.id = ChatData._id_counter
        self.person_id = person_id
        self.content = content
        self.person=chatroom.find_person(person_id)
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
        self.chatroom=chatroom

    def append_comment(self, comment):
        self.comments.append(comment)


class User(Person):
    def __init__(self,name: str,chatroom: ChatRoom):
        super().__init__(name,chatroom) 

class ParticipantBot(Person):
    emotions = ["happy", "sad", "angry", "surprised", "disgusted", "fearful", "neutral"]
    def __init__(self, name, chatroom:ChatRoom, background: str="",persona:str=""):
        super().__init__(name,chatroom)
        self.background=background
        self.persona=persona
        self.emotion="neutral"

    def personal_data_to_str(self):
        return (
            f"あなたは{self.name}という名前のエージェントです。\n"
            f"エージェントの特徴:\n"
            f"    背景:{self.background},\n"
            f"    属性:{self.persona}\n"
            f"    現在の感情:{self.emotion}\n"            
            f"##########################################\n"
        )
            
    def generate_response(self):
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.personal_data_to_str()

            user += "これまでの会話の流れ\n"
            user += self.chatroom.chatlog_str
            user += "######################################\n"
            user += "これまでの流れに沿うように応答を生成してください"
            return user, system
        user, system = create_input_prompt(self)
        response = get_gpt(user, system, temperature=1, max_tokens=1000)
        return response
    
    def generate_emotion(self):
        # CoTとかしてもいいかも
        def create_input_prompt(self):
            system = ""
            user = ""
            system += self.personal_data_to_str()
            system +=f"感情の選択肢: {str(self.emotions)}\n"
            system +=f"このエージェントの次の感情を選択肢の中から選択し、感情の名前のみ文字列で返してください\n"

            user += "直近の会話の流れ\n"
            user += self.chatroom.chatlog_str
            user += "######################################\n"
            user += "これまでの流れにからどのような感情を生成するか選択してください\n"
            return user, system
        user, system = create_input_prompt(self)
        print(user)
        print(system)   
        response = get_gpt(user, system, temperature=0.5, max_tokens=100)
        return response

