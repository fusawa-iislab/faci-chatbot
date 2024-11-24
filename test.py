from chat_setting.chat_environment import ChatRoom
import sys
import json

test_chatroom = ChatRoom()
with open('./test_data/3/3.json', 'r') as file:
    data = json.load(file)
test_chatroom.init_setting_from_dict(data)

test_person=test_chatroom.participantbots[0]

print(test_person.generate_emotion(test_chatroom))
