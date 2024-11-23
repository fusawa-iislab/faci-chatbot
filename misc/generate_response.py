
from dpr import question_top_similarities
from backend.utils.gpt_function import get_gpt
from backend.utils.misc import load_data_from_text
import torch

def log_to_prompt_array(input_list,is_summery,is_chatlog):
    if not isinstance(input_list,list):
        print("リストを渡してください")
        return None
    output=""
    for item in input_list:
        if isinstance(item,str):
            output+=item + "\n"
        elif isinstance(item,dict):
            if is_summery:
                output+=item["content"]+"\n"
            elif is_chatlog:
                output+=item["name"]+": "+item["content"]+"\n"
    return output


def create_absutuct(participants: list):
    title="気候変動"
    output=""

    output+=f"現在は{title}について集団で議論しています\n"
    output+="議論ではuser,"
    for p in participants:
        output+=f"{p.name}、"
    output+="の参加者がおり、userは司会者、その他の人は実際に意見・感想を述べます\n"
    
    return output


def generate_response(p:Participant,input_data,context_embeddings,chatlog,summery_log,participants):
    context_similar_index=question_top_similarities(input_data,context_embeddings,3)
    top_summery=[summery_log[i] for i in context_similar_index]
    recent_chatlog=chatlog[(-1)*(min(len(chatlog),5)):]

    system_prompt=""

    abstruct=create_absutuct(participants)
    system_prompt+=abstruct+"\n"
    
    system_prompt+="過去の発言で関連するもの\n"
    system_prompt+=log_to_prompt_array(top_summery,True,False) + "\n"

    system_prompt+="直前の会話の流れ\n"
    system_prompt+=log_to_prompt_array(recent_chatlog,False,True) + f"{input_data["name"]}"+": "+f"{input_data["content"]}"+"\n"

    system_prompt+=f"{p.persona}という特徴を持つ{p.name}として直前の流れに合うように自然な応答を生成してください\n"
    system_prompt+="""・条件
    あなたは話を振らなくていいです
    初めに自分の名前を書かずに、発言内容だけ述べてください
    """

    user_prompt=input_data["content"]
    response=get_gpt(prompt=user_prompt,system=system_prompt,max_tokens=200,temperature=1)

    return response












    
