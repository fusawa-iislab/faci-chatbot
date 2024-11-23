
import requests
from dotenv import load_dotenv
import ast

from backend.utils.gpt_function import get_gpt
from backend.utils.misc import load_data_from_text

MAX_TOKENS=100




facilitator="user"



def create_summmery(chat_content):
    summery_system="""あなたは文章の内容を理解し、要約を生成するマシンです。入力内容を要約してどのようなことを思っているか簡潔にまとめてください。
・要件定義
要約する上では、発言者の名前を含む(敬称なし)
どのような行動をしたのではなく、どのようなことを考えているかを示す。"""
    gpt_prompt=f"{chat_content["name"]}: 「{chat_content["content"]}」"
    if chat_content["name"]==facilitator:
        return None
    else:
        simple_content={"name":chat_content["name"],"content":get_gpt(prompt=gpt_prompt,system=summery_system,temperature=0.1)}
        return simple_content

if __name__=="__main__":
    contents=load_data_from_text("./test_data/1.txt")
    simple_contents=[]
    for content in contents:
        s=create_summmery(content)
        if s:
            simple_contents.append(s)
    print(simple_contents)
    




