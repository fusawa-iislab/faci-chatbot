from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="frontend/build", static_url_path="")

# ルートにアクセスしたときに、ビルドされたindex.htmlを返す
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# その他の静的ファイル（JS、CSSなど）を提供
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
