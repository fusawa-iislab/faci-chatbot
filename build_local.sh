pip install -r requirements.txt

# .envファイルを読み込んで環境変数に追加
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# フロントエンドのビルド
cd frontend

if [ -f .env ]; then
    rm .env
fi

touch .env

echo "REACT_APP_BACKEND_PATH=$BACKEND_PATH_TEST" >> .env

npm install