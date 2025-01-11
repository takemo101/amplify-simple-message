# Amplifyで作る超シンプルチャット
今回は、Amplify Gen2のAppSync(GraphQL) + Lambdaだけを使って超シンプルなチャットを作りましたが、本来はDynamoDBをデータソースに使った方が圧倒的に簡単です。

## 実行方法
このプロジェクトは``pnpn``を使っているのでインストールしてください。

### Amplifyのsandboxの立ち上げ
Amplifyのsandboxを立ち上げるためには、AWSのIAMのユーザーを作成し、そのユーザーのアクセスキーとシークレットキーを取得する必要があります。
そのアクセスキーとシークレットキーを``profile``に設定して、sandboxを立ち上げの時に指定してください。
```bash
pnpm ampx sandbox --profile=<your-profile>
```

### Amplifyのsandboxの削除
```bash
pnpm ampx sandbox delete --profile=<your-profile>
```

### フロントの実行
```bash
pnpm dev
```

## ルール

### コミットメッセージ
- コミットメッセージは必ず日本語で書く
- コミットメッセージは以下のフォーマットで書く
  - `[add/feat/fix/remove/update/refactor/chore/...] メッセージ`
  - 例: `[add] 新しいファイルを追加`
