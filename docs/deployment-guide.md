# times_esa デプロイメントガイド

## 概要

times_esaは、GitHub Actionsを使用した自動デプロイメントシステムを採用しています。masterブランチへのプッシュで自動的に本番環境にデプロイされます。

## デプロイメント構成

### 自動デプロイメント

```
GitHub Repository (master branch)
        ↓ push
GitHub Actions
        ↓ build & deploy
Firebase Hosting + Cloud Functions
```

### 手動操作は不要

- **コマンド実行不要**: 手動でのデプロイコマンド実行は必要ありません
- **自動化**: すべてGitHub Actionsで自動処理されます
- **並行デプロイ**: フロントエンドとバックエンドが並行してデプロイされます

## GitHub Actions ワークフロー

### 1. チェック用ワークフロー

すべてのプッシュで実行される品質チェック：

#### フロントエンド チェック
**ファイル**: `.github/workflows/check_firebase_hosting.yaml`

```yaml
name: Firebase Hosting部分の確認
on: [push]
jobs:
  check_firebase_hosting:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 22
      - npm install
      - npm run build
      - npm test
```

#### バックエンド チェック
**ファイル**: `.github/workflows/check_firebase_cloud_function.yaml`

```yaml
name: Firebase Cloud Function部分の確認
on: [push]
jobs:
  check_firebase_cloud_function:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 22
      - npm install (functions)
      - npm run lint
      - npm run build
      - npm run test
```

### 2. デプロイ用ワークフロー

masterブランチへのプッシュで実行される本番デプロイ：

#### フロントエンド デプロイ
**ファイル**: `.github/workflows/deploy_firebase_hosting.yaml`

```yaml
name: Firebase Hostingでのdeployを実行する
on:
  push:
    branches: [ master ]
concurrency:
  group: firebase-hosting-deploy-production
  cancel-in-progress: false
```

**処理フロー**:
1. コードチェックアウト
2. Node.js 22 セットアップ
3. 依存関係インストール
4. 環境変数設定でReactアプリビルド
5. Firebase CLI セットアップ
6. Google認証情報設定
7. Firebase Hosting デプロイ
8. 認証情報クリーンアップ

#### バックエンド デプロイ
**ファイル**: `.github/workflows/deploy_firebase_clooud_function.yaml`

```yaml
name: Firebase Cloud Functionsでのdeployを実行する
on:
  push:
    branches: [ master ]
concurrency:
  group: firebase-functions-deploy-production
  cancel-in-progress: false
```

**処理フロー**:
1. コードチェックアウト
2. Node.js 22 セットアップ
3. 依存関係インストール (functions)
4. Firebase CLI セットアップ
5. Google認証情報設定
6. Firebase Cloud Functions デプロイ
7. 認証情報クリーンアップ

## 必要な環境変数・シークレット

### GitHub Secrets

以下のシークレットがGitHubリポジトリに設定されている必要があります：

#### 認証関連
```
GOOGLE_APPLICATION_CREDENTIALS  # Firebase認証情報のパス
GCLOUD_SERVICE_KEY             # Base64エンコードされたサービスアカウントキー
```

#### フロントエンド環境変数
```
VITE_API_KEY                   # Firebase API Key
VITE_AUTH_DOMAIN              # Firebase Auth Domain
VITE_PROJECT_ID               # Firebase Project ID
VITE_STORAGE_BUCKET           # Firebase Storage Bucket
VITE_MESSAGING_SENDER_ID      # Firebase Messaging Sender ID
VITE_APP_ID                   # Firebase App ID
VITE_MEASUREMENT_ID           # Google Analytics Measurement ID
VITE_VALID_MAIL_ADDRESSES     # 認証許可メールアドレス（カンマ区切り）
```

### Firebase Functions 環境変数

Cloud Functions側で設定される環境変数：

```
ESA_TEAM_NAME      # esa.ioのチーム名
ESA_ACCESS_TOKEN   # esa.ioのアクセストークン
VALID_EMAIL        # 認証で許可するメールアドレス
```

## デプロイフロー

### 通常の開発フロー

1. **開発ブランチで作業**
   ```bash
   git checkout -b feature/new-feature
   # 開発作業
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **プルリクエスト作成**
   - GitHub上でプルリクエストを作成
   - チェック用ワークフローが自動実行
   - テスト・ビルドが成功することを確認

3. **masterブランチにマージ**
   ```bash
   git checkout master
   git merge feature/new-feature
   git push origin master
   ```

4. **自動デプロイ実行**
   - GitHub Actionsが自動的にデプロイを開始
   - フロントエンドとバックエンドが並行してデプロイ
   - 完了後、本番環境に反映

### 緊急時の手動デプロイ

通常は不要ですが、緊急時には手動でデプロイ可能：

```bash
# フロントエンド
npm run build
firebase deploy --only hosting

# バックエンド
cd functions
npm run build
firebase deploy --only functions
```

## デプロイ状況の確認

### GitHub Actions

1. GitHubリポジトリの「Actions」タブを確認
2. 実行中・完了したワークフローの状態を確認
3. エラーがある場合はログを確認

### Firebase Console

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. **Hosting**: デプロイ履歴とドメイン状況を確認
4. **Functions**: 関数の実行状況とログを確認

## トラブルシューティング

### よくある問題

#### 1. ビルドエラー

**症状**: GitHub Actionsでビルドが失敗
**対処法**:
- ローカルで `npm run build` を実行して事前確認
- TypeScriptエラーやlintエラーを修正
- 依存関係の問題を確認

#### 2. 環境変数エラー

**症状**: デプロイは成功するが、アプリが正常に動作しない
**対処法**:
- GitHub Secretsの設定を確認
- 環境変数名のタイポを確認
- Firebase Functionsの環境変数設定を確認

#### 3. 認証エラー

**症状**: Firebase デプロイで認証エラー
**対処法**:
- `GCLOUD_SERVICE_KEY` の内容を確認
- サービスアカウントの権限を確認
- Firebase プロジェクトの設定を確認

#### 4. 並行デプロイの競合

**症状**: 複数のデプロイが同時実行されてエラー
**対処法**:
- `concurrency` 設定により自動的に制御される
- 前のデプロイ完了を待ってから次のプッシュを行う

### ログの確認方法

#### GitHub Actions ログ
1. リポジトリの「Actions」タブ
2. 失敗したワークフローをクリック
3. 各ステップのログを確認

#### Firebase Functions ログ
```bash
# ローカルから確認
firebase functions:log

# または Firebase Console で確認
```

## セキュリティ考慮事項

### シークレット管理

- **GitHub Secrets**: 機密情報は必ずSecretsに保存
- **環境変数の分離**: 開発・本番環境の設定を分離
- **アクセス権限**: 必要最小限の権限でサービスアカウントを設定

### デプロイ権限

- **masterブランチ保護**: 直接プッシュを制限
- **レビュー必須**: プルリクエストでのコードレビューを実施
- **自動テスト**: デプロイ前の品質チェックを必須化

## 監視・運用

### デプロイ通知

現在は設定されていませんが、以下の通知設定が推奨されます：

- Slack通知（デプロイ成功・失敗）
- メール通知（重要なエラー）
- Discord通知（チーム連携）

### パフォーマンス監視

- **Firebase Performance Monitoring**: 自動的に有効
- **Google Analytics**: アクセス解析
- **Error Reporting**: エラーの自動収集

## まとめ

times_esaのデプロイメントは完全に自動化されており、開発者は以下の点のみ注意すれば十分です：

1. **masterブランチへのマージ**: 自動デプロイのトリガー
2. **テストの実行**: ローカルでの事前確認
3. **環境変数の管理**: GitHub Secretsの適切な設定

手動でのコマンド実行は通常不要で、GitHub Actionsがすべて自動処理します。
