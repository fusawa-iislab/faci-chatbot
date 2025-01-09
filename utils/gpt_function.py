import os
import requests
from openai import OpenAI
from flask_socketio import SocketIO
from flask_socketio import emit
from dotenv import load_dotenv
load_dotenv() 


OPENAI_API_KEY=os.environ.get("OPENAI_API_KEY")
OPENAI_ORGANIZATION_ID=os.environ.get("OPENAI_ORGANIZATION_ID")
OPENAI_PROJECT=os.environ.get("OPENAI_PROJECT")
url_gpt = 'https://api.openai.com/v1/chat/completions'
gpt_headers={
    'Content-type': 'application/json',
    'Authorization': f'Bearer {OPENAI_API_KEY}',
}

client = OpenAI(api_key=OPENAI_API_KEY)


def get_gpt(prompt :str ,system : str,temperature : float =1, max_tokens : int =100):
    data = {"model": 'gpt-4o',
        "messages":[
                    {"role": "system", "content": f"{system}"},
                    {"role": "user", "content": f"{prompt}"}
                    ],
        "temperature": temperature,
    }
    if max_tokens>0:
        data["max_tokens"]=max_tokens
    response = requests.post(url_gpt, headers=gpt_headers, json=data).json()
    res_content=response["choices"][0]['message']["content"]
    return res_content


def get_gpt_streaming(prompt: str, system: str, temperature: float = 1, max_tokens: int = 100, socket: SocketIO = None, socket_name: str = None):
    data = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": f"{system}"},
            {"role": "user", "content": f"{prompt}"}
        ],
        "temperature": temperature,
        "stream": True
    }
    if max_tokens > 0:
        data["max_tokens"] = max_tokens

    stream = client.chat.completions.create(**data)
    output = ""
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            ele = chunk.choices[0].delta.content
            if socket_name:
                socket.emit(socket_name, ele)
            output += ele
        else:
            if socket_name:
                socket.emit(socket_name, "nocontent")
    return output

if __name__=="__main__":
    get_gpt_streaming("こんにちは","userの入力に対して否定してください")
