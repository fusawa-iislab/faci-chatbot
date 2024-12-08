from chat_environment.chat_environment import ChatRoom
import json

from utils.gpt_function import get_gpt
from chat_environment.process_data import participants_raise_hands_to_speak

from utils.misc import create_templates_dict_from_json
# selected_person = test_chatroom.participantbots[-1]
# selected_person.background = ""
# selected_person.persona = "少しシャイで自分のことを話すのが苦手な性格"
# selected_person.other_features={"特徴":"紋切り型の返事をし、少しぶっきらぼうな印象がある"}
# response = selected_person.generate_response()

print(create_templates_dict_from_json("./data/templates"))




