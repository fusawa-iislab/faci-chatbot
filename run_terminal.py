from group_setting.chatroom import ChatRoom
import sys
import json

test_chatroom = ChatRoom()

if len(sys.argv) > 1:
    file_path = sys.argv[1]
else:
    file_path = './test_data/3/3.json'

with open(file_path, 'r') as file:
    data = json.load(file)
test_chatroom.init_setting_from_dict(data)

while True:
    if test_chatroom.participantbots and test_chatroom.user:
        print("############################################################")
        print("Please choose an option:")
        for bot in test_chatroom.participantbots:
            print(f"{bot.person_id}.{bot.name}" ,end="/")
        print("0.none of the above" )

        choice = int(input("Enter the number of your choice: "))
        if choice == 0:
            selected_person = None
            print("talk to everyone")
        else:
            selected_person = test_chatroom.find_person(choice)
            print(f"You selected: {selected_person.name}")
        message = input("Enter your message (or 'exit' to quit): ")
        for _ in range(6):
            sys.stdout.write("\033[1A")  # カーソルを1行上に移動
            sys.stdout.write("\033[2K")  # 現在の行をクリア
            sys.stdout.flush()
        if message.lower() == 'exit':
            break
        elif selected_person is None:
            test_chatroom.add_chatdata(test_chatroom.user.person_id, message)
            print("You: ", message)
        else:
            test_chatroom.add_chatdata(test_chatroom.user.person_id, message)
            print(f"You: {message}")
            response = selected_person.generate_response(test_chatroom)
            test_chatroom.add_chatdata(selected_person.person_id, response)
            print(f"{selected_person.name}: {response}")
    else:
        break



