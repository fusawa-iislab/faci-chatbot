import ast

from pathlib import Path

def create_templates_dict_from_json(directory: str) -> dict:
    data_types = ["situation","person"]
    templates_dict = {data_type:[] for data_type in data_types}
    for file_path in Path(directory).rglob("*.json"): 
        with open(file_path, "r") as f:
            content = f.read()
        data = ast.literal_eval(content)
        data_type=data.pop("type",None)
        if data_type in data_types:
            templates_dict[data_type].append(data)
        else:
            raise ValueError(f"不正なデータタイプです: {data_type}")
    return templates_dict

#テキストファイルになってる
# def load_data_from_text(filename):
#     with open(filename,"r") as f:
#         content=f.read()
#     data=ast.literal_eval(content)
#     return data

