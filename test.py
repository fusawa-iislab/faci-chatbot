from chat_setting.chat_environment import ChatRoom
import json

from utils.gpt_function import get_gpt

test_chatroom = ChatRoom.create_chatroom()
with open('./test_data/3/3_test.json', 'r') as file:
    data = json.load(file)
test_chatroom.init_setting_from_dict(data)


selected_person = test_chatroom.participantbots[-1]
selected_person.background = """昨日ちょうど薬物を使用してしまった。
セッションに参加するがなかなかやめられない"""
selected_person.persona = ""
selected_person.other_features={"特徴":"自身の薬物使用の様子について生々しい表現をし、薬物を使用することによる高揚感を楽しげに表現する"}
response = selected_person.generate_response()

print(response)



