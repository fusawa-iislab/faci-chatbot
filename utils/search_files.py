import os

## run.pyからの相対パスで画像のパスを取得

def get_template_image_paths():
    directory = './static/images/default/participants/'
    image_paths = []
    for _, _, files in os.walk(directory):
        for file in files:
            image_paths.append(f"/static/images/default/participants/{file}")
    return image_paths
