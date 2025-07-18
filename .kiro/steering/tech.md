---
inclusion: always
---

# times_esa 技術スタック

詳細な技術情報については以下のドキュメントを参照してください：

- #[[file:docs/architecture.md]] - システム全体のアーキテクチャ
- #[[file:docs/developer-guide.md]] - 開発環境とツール詳細

## 技術スタック概要

### フロントエンド
- **React 19.1** + **TypeScript 5.8** + **Material-UI 7.2** + **Vite 7.0**
- **状態管理**: React Hooksのみ（外部ライブラリ禁止）
- **スタイリング**: Material-UI sx prop推奨

### バックエンド
- **Firebase Cloud Functions** (Node.js 22) + **TypeScript 5.8**
- **esa.io REST API** + **Firebase Authentication**

### インフラ
- **Firebase Hosting** + **GitHub Actions** (asia-northeast1)

## 開発制約・パターン

詳細なコーディング規約とパターンについては：
- #[[file:docs/developer-guide.md]] - 開発フロー・環境設定
- #[[file:docs/component-specification.md]] - コンポーネント設計パターン
- #[[file:docs/api-specification.md]] - API設計パターン

### 必須制約
- **React**: 関数コンポーネント + Hooks のみ
- **TypeScript**: any型禁止、明示的型定義必須
- **認証**: Firebase Authentication + メールアドレス制限
- **API**: src/api/client.ts パターン踏襲

### 禁止事項
- 外部状態管理ライブラリ（Redux等）
- インラインスタイル
- 独自認証システム
- Express等の独自サーバー構築