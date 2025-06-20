## times_esa
slackの分報likeに投稿しつつ、検索しやすいようにesa.ioに投稿してくれるアプリです。

- [esa.ioに分報っぽく投稿するアプリをReactとFirebaseで作った - yasuhisa's blog](https://www.yasuhisay.info/entry/2021/01/04/090000)

## Usage
### frontend
- Firebaseを中心に使っています
- APIKEYなどの情報を`.env`に記述しましょう
  - [サンプルファイル](.env.sample)があります
  - `VITE_VALID_MAIL_ADDRESSES`は閲覧や書き込みを許可したいユーザーのメールアドレスです
- `npm run-script start`で起動します

### backend
- Firebase Functionsを使用しています
- 環境変数を`.env`ファイルに設定する必要があります：
  - `ESA_TEAM_NAME`: esa.ioのチーム名
  - `ESA_ACCESS_TOKEN`: esa.ioのアクセストークン
  - `VALID_EMAIL`: 認証で許可するメールアドレス
- テスト実行：
  - `cd functions && npm test` - テスト実行
  - `cd functions && npm run test:watch` - ウォッチモードでテスト実行
  - `cd functions && npm run test:coverage` - カバレッジ付きでテスト実行
