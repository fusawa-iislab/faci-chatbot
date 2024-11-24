from chat_setting.chat_environment import ChatRoom
from chat_setting.process_data import participants_emotion
import json

test_chatroom = ChatRoom.create_chatroom()
with open('./test_data/3/3.json', 'r') as file:
    data = json.load(file)
test_chatroom.init_setting_from_dict(data)

participants_emotion(None, test_chatroom)


