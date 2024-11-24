from app import app, app_socket

import sys
import os
import argparse
from chat_setting.chat_environment import ChatRoom
import json

def parse_args():
    parser = argparse.ArgumentParser(description='Run the Flask app.')
    parser.add_argument('-t', '--test', action='store_true', help='Run in test mode')
    parser.add_argument('-j', '--json-file', type=str, help='Load the specified file')
    return parser.parse_args()
args = parse_args()

if args.test:
    from app_test import app_test, app_socket_test
    app_socket = app_socket_test
    app = app_test
else:
    from app import app, app_socket


if __name__ == '__main__':
    chatroom=ChatRoom.create_chatroom()
    if args.json_file:
        if not os.path.exists(args.json_file):
            print(f"指定されたファイルが存在しません: {args.json_file}")
        with open(args.json_file, 'r', encoding="utf-8") as file:
            data = json.load(file)
        chatroom.init_setting_from_dict(data)


    app_socket.run(app, host="127.0.0.1", port=5050, debug=True)
