from utils.gpt_function import get_gpt


class Person:
    _id_counter=0
    def __init__(self, name):
        self.name = name
        self.comments = []
        Person._id_counter+=1
        self.person_id=Person._id_counter

    def append_comment(self, comment):
        self.comments.append(comment)


class User(Person):
    def __init__(self,name):
        super().__init__(name) 

class ParticipantBot(Person):
    emotions = ["happy", "sad", "angry", "surprised", "disgusted", "fearful", "neutral"]
    def __init__(self, name, background: str="",persona:str=""):
        super().__init__(name)
        self.background=background
        self.persona=persona
        self.emotion="neutral"

    def update_properties(self, name=None, background=None, persona=None):
        if name is not None:
            self.name = name
        if background is not None:
            self.background = background
        if persona is not None:
            self.persona = persona

    def personal_data_to_str(self):
        return (
            f"あなたは{self.name}という名前のエージェントです。\n"
            f"エージェントの特徴:\n"
            f"    背景:{self.background},\n"
            f"    属性:{self.persona}\n"
            f"    現在の感情:{self.emotion}\n"            
            f"##########################################\n"
        )
            
    def generate_response(self, cr):
        def create_input_prompt(cr):
            system = ""
            user = ""
            system += self.personal_data_to_str()

            user += "これまでの会話の流れ\n"
            user += cr.chatlog_str
            user += "######################################\n"
            user += "これまでの流れに沿うように応答を生成してください"
            return user, system
        user, system = create_input_prompt(cr)
        response = get_gpt(user, system, temperature=1, max_tokens=1000)
        return response
    
    def generate_emotion(self,cr):
        # CoTとかしてもいいかも
        def create_input_prompt(cr):
            system = ""
            user = ""
            system += self.personal_data_to_str()
            system +=f"感情の選択肢: {str(self.emotions)}\n"
            system +=f"このエージェントの次の感情を選択肢の中から選択し、感情の名前のみ文字列で返してください\n"

            user += "直近の会話の流れ\n"
            user += cr.chatlog_str
            user += "######################################\n"
            user += "これまでの流れにからどのような感情を生成するか選択してください\n"
            return user, system
        user, system = create_input_prompt(cr)
        print(user)
        print(system)   
        response = get_gpt(user, system, temperature=0.5, max_tokens=100)
        return response



