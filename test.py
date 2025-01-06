from chat_environment.chat_environment import ChatRoom
import json
import argparse

from utils.gpt_function import get_gpt
from chat_environment.process_data import participants_review_comment

from utils.misc import create_templates_dict_from_json

def parse_args():
    parser = argparse.ArgumentParser(description='Run the Flask app.')
    parser.add_argument('-t', '--test', action='store_true', help='Run in test mode')
    parser.add_argument('-j', '--json-file', type=str, help='Load the specified file')
    return parser.parse_args()
args = parse_args()


if __name__ == '__main__':
    chatroom=ChatRoom.create_chatroom()
    if args.json_file:
        with open(args.json_file, 'r', encoding="utf-8") as file:
            data = json.load(file)
        chatroom.init_setting_from_dict(data)

    participants_review_comment(chatroom)

    for bot in chatroom.participantbots:
        print(bot.name, bot.review_comment)

    


    




