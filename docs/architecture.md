# times_esa アーキテクチャ概要

## システム概要

times_esaは、Slackの分報のような投稿をesa.ioに自動投稿するWebアプリケーションです。React + TypeScriptで構築されたフロントエンドと、Firebase Cloud Functionsで構築されたバックエンドから構成されています。

## 全体アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│   (React)       │    │ (Cloud Functions)│    │   Services      │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • React 19.1    │◄──►│ • Firebase       │◄──►│ • esa.io API    │
│ • TypeScript    │    │   Functions      │    │ • Firebase Auth │
│ • Material-UI   │    │ • Node.js 22     │    │                 │
│ • Vite          │    │ • TypeScript     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │
        └────────────────────────┘
              Firebase Hosting
```

## フロントエンド構成

### 技術スタック
- **React 19.1** - UIライブラリ
- **TypeScript 5.8** - 型安全性の確保
- **Material-UI 7.2** - UIコンポーネント
- **Vite 7.0** - ビルドツール
- **Firebase SDK** - 認証とCloud Functions呼び出し

### ディレクトリ構造
```
src/
├── components/          # Reactコンポーネント
│   ├── Body/           # メインコンテンツ
│   ├── TimesEsa/       # 日報投稿UI
│   ├── DailyReport*/   # 日報表示関連
│   └── ...
├── api/                # API呼び出し層
│   ├── client.ts       # APIクライアント
│   ├── types.ts        # API型定義
│   └── mockData.ts     # モックデータ
├── config/             # 設定管理
├── firebase/           # Firebase設定
├── types/              # 型定義
└── util.ts             # ユーティリティ関数
```

### 主要コンポーネント
- **App.tsx** - ルートコンポーネント、認証状態管理
- **Body** - メインコンテンツの表示制御
- **TimesEsa** - 日報投稿・表示のメインUI
- **SignInDialog** - 認証ダイアログ
- **DailyReport系** - 日報の表示・編集機能

## バックエンド構成

### 技術スタック
- **Firebase Cloud Functions** - サーバーレス実行環境
- **Node.js 22** - ランタイム
- **TypeScript 5.8** - 型安全性の確保
- **Axios** - HTTP クライアント

### Cloud Functions一覧
| 関数名 | 機能 | 説明 |
|--------|------|------|
| `submitTextToEsa` | 投稿作成・更新 | esa.ioに日報を投稿または既存投稿を更新 |
| `dailyReport` | 日報取得 | 指定日の日報を取得 |
| `tagList` | タグ一覧取得 | esa.ioのタグ一覧を取得 |
| `recentDailyReports` | 最近の日報一覧 | 最近の日報リストを取得 |

### 主要機能
- **認証チェック** - Firebase Authenticationトークンの検証
- **esa.io API連携** - RESTful APIを通じたデータ操作
- **並行編集対応** - 複数セッションからの同時編集をマージ
- **エラーハンドリング** - 適切なエラーレスポンスの返却

## データフロー

### 投稿フロー
```
1. ユーザーが投稿内容を入力
2. フロントエンドがsubmitTextToEsa関数を呼び出し
3. Cloud Functionsが認証チェック
4. esa.io APIで既存投稿を検索
5. 新規作成 or 既存投稿更新
6. 結果をフロントエンドに返却
7. UIを更新して完了表示
```

### 日報取得フロー
```
1. ユーザーが日付を選択
2. フロントエンドがdailyReport関数を呼び出し
3. Cloud Functionsが認証チェック
4. esa.io APIで該当日の投稿を検索
5. 投稿詳細を取得
6. フロントエンドで日報を表示
```

## 認証・セキュリティ

### 認証方式
- **Firebase Authentication** - Google OAuth認証
- **メールアドレス制限** - 環境変数で許可ユーザーを制限
- **トークン検証** - Cloud Functions側でIDトークンを検証

### セキュリティ対策
- 環境変数による機密情報管理
- CORS設定によるオリジン制限
- 入力値検証とサニタイゼーション
- エラー情報の適切な隠蔽

## 外部サービス連携

### esa.io API
- **ベースURL**: `https://api.esa.io`
- **認証**: Bearer Token
- **主要エンドポイント**:
  - `GET /v1/teams/{team}/posts` - 投稿検索
  - `POST /v1/teams/{team}/posts` - 投稿作成
  - `PATCH /v1/teams/{team}/posts/{number}` - 投稿更新
  - `GET /v1/teams/{team}/tags` - タグ一覧

### Firebase Services
- **Authentication** - ユーザー認証
- **Cloud Functions** - サーバーレス実行
- **Hosting** - 静的サイトホスティング

## 開発・運用環境

### 開発環境
- **モックモード** - esa.io APIを使わずにローカル開発
- **Firebase Emulator** - ローカルでCloud Functions実行
- **Hot Reload** - Viteによる高速開発

### 本番環境
- **Firebase Hosting** - フロントエンドホスティング
- **Cloud Functions** - asia-northeast1リージョンで実行
- **GitHub Actions** - 自動デプロイメント

## パフォーマンス特性

### フロントエンド
- **バンドルサイズ最適化** - Viteによる効率的なビルド
- **コンポーネント分割** - 適切な粒度でのコード分割
- **状態管理** - React Hooksによる軽量な状態管理

### バックエンド
- **コールドスタート対策** - 軽量な依存関係
- **並行処理** - 複数リクエストの効率的な処理
- **キャッシュ戦略** - 適切なレスポンスキャッシュ

## 拡張性・保守性

### 設計原則
- **関心の分離** - UI、ビジネスロジック、データアクセスの分離
- **型安全性** - TypeScriptによる静的型チェック
- **テスタビリティ** - モック機能とテストフレームワーク対応
- **設定の外部化** - 環境変数による設定管理
