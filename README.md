## 実行方法

### 1,pythonの仮想環境の準備
```
python3 -m venv env
source env/bin/activate
```
歌唱環境を修了する場合は
```
deactivate
```

### 2,.envファイルの準備
.env.sampleファイルの内容をコピーして必要なところを埋めてください

コマンド:
```
cp .env.sample .env
```
特にデフォルトでOpenAI API周りは埋めていないので必ず埋めてください

### 3,引き続き環境の準備
コマンド:
```
./build_local.sh
```
pythonのインストール、フロントの環境変数、インストールを行います

### 4, 実行

※先にバックエンドを立てた方が安心です
- バックエンド
```
python3 run.py -t
```
または
```
python3 run.py --test
```
- フロントエンド
別のターミナルで以下のものを実行してください
```
cd frontend
npm start
```

おそらく(デフォルトでは)http://localhost:3000 でフロントエンドが立っているので、アクセスできると思います
