from datetime import datetime

class ChatData:
    _id_counter=0
    def __init__(self,person_id:int,content,cr):#crはChatRoomの略
        ChatData._id_counter += 1
        self.id = ChatData._id_counter
        self.person_id = person_id
        self.content = content
        self.person=cr.find_person(person_id)

    @classmethod
    def reset(cls):
        cls._id_counter = 0



