# times_esa 開発者ガイド

## 概要

このガイドでは、times_esaプロジェクトの開発環境セットアップから日常的な開発フローまでを説明します。

## 前提条件

開発を始める前に、以下のツールがインストールされていることを確認してください：

- **Node.js 22** - [公式サイト](https://nodejs.org/)からインストール
- **npm** - Node.jsと一緒にインストールされます
- **Git** - バージョン管理
- **Firebase CLI** - `npm install -g firebase-tools`

## プロジェクト構成

```
times_esa/
├── src/                    # フロントエンドソースコード
├── functions/              # Firebase Cloud Functions
├── docs/                   # ドキュメント
├── .github/workflows/      # GitHub Actions
├── dist/                   # ビルド成果物
├── package.json           # フロントエンド依存関係
└── functions/package.json # バックエンド依存関係
```

## 初期セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd times_esa
```

### 2. 依存関係のインストール

```bash
# フロントエンドの依存関係
npm install

# バックエンドの依存関係
cd functions
npm install
cd ..
```

### 3. 環境変数の設定

#### フロントエンド環境変数

`.env.sample`をコピーして`.env`ファイルを作成：

```bash
cp .env.sample .env
```

`.env`ファイルを編集して以下の値を設定：

```env
# Firebase設定（Firebase Consoleから取得）
VITE_API_KEY="your-api-key"
VITE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_PROJECT_ID="your-project-id"
VITE_STORAGE_BUCKET="your-project.appspot.com"
VITE_MESSAGING_SENDER_ID="123456789"
VITE_APP_ID="1:123456789:web:abcdef"
VITE_MEASUREMENT_ID="G-XXXXXXXXXX"

# 認証許可ユーザー（カンマ区切り）
VITE_VALID_MAIL_ADDRESSES="user1@example.com,user2@example.com"

# 開発時のモックモード（オプション）
VITE_USE_MOCK_API="true"
```

#### バックエンド環境変数

`functions/.env`ファイルを作成：

```bash
cd functions
touch .env
```

以下の内容を設定：

```env
# esa.io設定
ESA_TEAM_NAME="your-team-name"
ESA_ACCESS_TOKEN="your-esa-access-token"

# 認証設定
VALID_EMAIL="your-email@example.com"
```

### 4. Firebase プロジェクトの設定

```bash
# Firebaseにログイン
firebase login

# プロジェクトを選択
firebase use --add
```

## 開発フロー

### モックモードでの開発

実際のesa.io APIを使わずに開発する場合：

```bash
# .envでモックモードを有効化
echo "VITE_USE_MOCK_API=true" >> .env

# 開発サーバー起動
npm start
```

ブラウザが自動で開き、`http://localhost:5173`でアプリケーションが起動します。

### 本格的な開発

#### フロントエンド開発

```bash
# 開発サーバー起動（ホットリロード有効）
npm start

# ビルド
npm run build

# テスト実行
npm test
```

#### バックエンド開発

```bash
cd functions

# TypeScriptのコンパイル（ウォッチモード）
npm run watch

# 別ターミナルでエミュレーター起動
npm run serve

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage
```

### 統合開発

フロントエンドとバックエンドを同時に開発する場合：

```bash
# ターミナル1: バックエンドエミュレーター
cd functions
npm run serve

# ターミナル2: フロントエンド開発サーバー
npm start
```

## コード品質管理

### Linting

```bash
# フロントエンドのlint
npm run lint

# バックエンドのlint
cd functions
npm run lint
```

### フォーマット

プロジェクトではPrettierを使用しています。多くのエディタで自動フォーマットが設定できます。

### TypeScript

型チェックは開発時に自動で実行されますが、手動で確認する場合：

```bash
# フロントエンド
npx tsc --noEmit

# バックエンド
cd functions
npx tsc --noEmit
```

## テスト

### フロントエンドテスト

```bash
# 全テスト実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

### バックエンドテスト

```bash
cd functions

# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

## デバッグ

### フロントエンドデバッグ

- ブラウザの開発者ツールを使用
- React Developer Toolsの活用
- Viteの高速なHMR（Hot Module Replacement）

### バックエンドデバッグ

```bash
cd functions

# Firebase Functions Shellでデバッグ
npm run shell

# ログ確認
npm run logs
```

## 環境別設定

### 開発環境

- モックモードの活用
- ホットリロード
- 詳細なエラー表示

### 本番環境

- 環境変数による設定
- 最適化されたビルド
- エラー情報の適切な隠蔽

## よくある問題と解決方法

### Node.jsバージョンエラー

```bash
# Node.jsバージョン確認
node --version

# 必要に応じてNode.js 22をインストール
```

### Firebase認証エラー

```bash
# 再ログイン
firebase logout
firebase login

# プロジェクト設定確認
firebase projects:list
firebase use <project-id>
```

### 依存関係の問題

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# バックエンドも同様
cd functions
rm -rf node_modules package-lock.json
npm install
```

### ポート競合

開発サーバーのポートが使用中の場合：

```bash
# 別のポートで起動
npm start -- --port 3001
```

## 開発のベストプラクティス

### コミット前チェックリスト

- [ ] Lintエラーがないか確認
- [ ] テストが通るか確認
- [ ] TypeScriptエラーがないか確認
- [ ] 不要なconsole.logを削除

### コードレビューポイント

- 型安全性の確保
- エラーハンドリングの適切性
- パフォーマンスへの配慮
- セキュリティ上の問題がないか

### 新機能開発の流れ

1. 機能ブランチを作成
2. 必要に応じてテストを先に書く（TDD）
3. 実装
4. テスト実行
5. コードレビュー
6. マージ

## 参考リンク

- [React公式ドキュメント](https://react.dev/)
- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Material-UI公式ドキュメント](https://mui.com/)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [esa.io API仕様](https://docs.esa.io/posts/102)