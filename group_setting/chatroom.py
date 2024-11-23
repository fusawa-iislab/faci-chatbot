import torch

from group_setting.person import Person,User,ParticipantBot
from group_setting.chatdata import ChatData
import json


class ChatRoom:
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

    def find_person(self, person_id):
        for p in self.persons:
            if p.person_id==person_id:
                return p
        raise NotImplementedError("idのpersonが見つかりません")
        
    def init_setting_from_dict(self, data):
        self.title = data.get("title", "")
        self.description = data.get("description", "")
        for person_data in data.get("personsdata", []):
            self.add_person(person_data["type"], person_data["args"])
        self.chatlog=[]
        self.summerylog=[]
        self.context_vec=torch.tensor(([0]))
        if data.get("chatlog"):
            self.load_chatlog(data["chatlog"])

    def load_chatlog(self, data):
        for d in data:
            self.add_chatdata(**d)

            
    def add_person(self,type:str,args:dict):
        if type == "Person":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            person = Person(name=args["name"])
            self.persons.append(person)
        elif type == "User":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            if not self.user:
                user = User(args["name"])
                self.persons.append(user)
                self.user=user
            else:
                raise ValueError("User is aliready defined")
        elif type == "ParticipantBot":
            if "name" not in args:
                raise ValueError("Missing required argument: 'name'")
            background = args.get("background", "")
            persona = args.get("persona", "")
            participant = ParticipantBot(name=args["name"], background=background, persona=persona)
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
    
#default clean chatroom
chatroom=ChatRoom()