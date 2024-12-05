from chat_environment.chat_environment import ChatRoom
import json

from utils.gpt_function import get_gpt
from chat_environment.process_data import participants_raise_hands_to_speak

test_chatroom = ChatRoom.create_chatroom()
with open('./data/test/3/3_test.json', 'r') as file:
    data = json.load(file)
test_chatroom.init_setting_from_dict(data)


# selected_person = test_chatroom.participantbots[-1]
# selected_person.background = ""
# selected_person.persona = "少しシャイで自分のことを話すのが苦手な性格"
# selected_person.other_features={"特徴":"紋切り型の返事をし、少しぶっきらぼうな印象がある"}
# response = selected_person.generate_response()


participants_raise_hands_to_speak(None, test_chatroom)



