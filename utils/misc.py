import ast

#テキストファイルになってる
def load_data_from_text(filename):
    with open(filename,"r") as f:
        content=f.read()
    data=ast.literal_eval(content)
    return data
