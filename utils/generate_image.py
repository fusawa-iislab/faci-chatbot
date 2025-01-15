import openai
import requests
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_ORGANIZATION_ID = os.environ.get("OPENAI_ORGANIZATION_ID")
OPENAI_PROJECT = os.environ.get("OPENAI_PROJECT")
url_gpt = "https://api.openai.com/v1/images/generations"
gpt_headers={
    'Content-type': 'application/json',
    'Authorization': f'Bearer {OPENAI_API_KEY}',
}

# OpenAI APIキーを設定
openai.api_key = OPENAI_API_KEY


def generate_image(prompt,i):
    data = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
    }
    response = requests.post(url_gpt, headers=gpt_headers, json=data).json()
    image_url = response['data'][0]['url']
    image_data = requests.get(image_url).content
    filename = f"template-{i}.png"
    with open(filename, 'wb') as handler:
        handler.write(image_data)

if __name__ == "__main__":
    prompt = "リアルな人の顔のイメージ、正面を向いていてカラーで一人"
    for i in [9]:
        generate_image(prompt,i)