---
inclusion: always
---

# times_esa 技術スタック

## フロントエンド技術スタック

### 主要フレームワーク・ライブラリ
- **React 19.1**: UIライブラリ（関数コンポーネント + Hooks）
- **TypeScript 5.8**: 静的型付け言語
- **Material-UI 7.2**: UIコンポーネントライブラリ
- **Vite 7.0**: ビルドツール・開発サーバー

### 状態管理
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **外部ライブラリ禁止**: Redux, Zustand, Jotai等は使用しない

### スタイリング
- **Material-UI sx prop**: 推奨スタイリング方法
- **styled-components**: 必要な場合のみ使用
- **インラインスタイル**: 禁止

### ユーティリティライブラリ
- **date-fns 4.1**: 日付操作
- **react-copy-to-clipboard 5.1**: クリップボード操作

## バックエンド技術スタック

### 実行環境
- **Firebase Cloud Functions**: サーバーレス実行環境
- **Node.js 22**: ランタイム
- **TypeScript 5.8**: 静的型付け言語

### HTTP通信
- **Axios 1.10**: HTTPクライアント
- **Firebase Functions v2**: onCall関数

### 外部API連携
- **esa.io REST API**: 主要データソース
- **Firebase Authentication**: 認証サービス

## 開発・ビルドツール

### パッケージ管理
- **npm**: パッケージマネージャー
- **package-lock.json**: 依存関係固定

### コード品質
- **ESLint 9.31**: 静的解析ツール
- **Prettier 3.6**: コードフォーマッター
- **TypeScript**: 型チェック

### テスト
- **Vitest 3.2**: テストフレームワーク（フロントエンド・バックエンド共通）
- **@testing-library/react 16.3**: Reactコンポーネントテスト
- **jsdom 26.1**: DOM環境シミュレーション

## インフラ・デプロイ

### ホスティング
- **Firebase Hosting**: 静的サイトホスティング
- **Firebase Cloud Functions**: サーバーレス実行（asia-northeast1）

### CI/CD
- **GitHub Actions**: 自動ビルド・デプロイ
- **Node.js 22**: CI環境

### 認証・セキュリティ
- **Firebase Authentication**: Google OAuth認証
- **環境変数**: 機密情報管理

## 技術的制約・方針

### 必須パターン

#### React コンポーネント
```typescript
// 必須: 関数コンポーネント + TypeScript
const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Hooks使用
  const [state, setState] = useState<StateType>(initialValue);
  
  // JSX return
  return <div>{/* JSX */}</div>;
};
```

#### Cloud Functions
```typescript
// 必須: onCall + 認証チェック
export const myFunction = onCall(
  { secrets: REQUIRED_SECRETS },
  async (req: CallableRequest<RequestType>) => {
    checkAuthTokenEmail(req);
    // 処理
    return response;
  }
);
```

#### API呼び出し
```typescript
// 必須: src/api/client.ts パターン
const result = await apiClient.methodName(params);
```

### 禁止事項

#### フロントエンド
- クラスコンポーネントの使用
- 外部状態管理ライブラリ（Redux等）
- インラインスタイル
- any型の使用

#### バックエンド
- Express等の独自サーバー構築
- 直接的なデータベース操作
- 認証の独自実装

### 推奨パターン

#### ディレクトリ構造
```
src/
├── components/          # Reactコンポーネント
│   └── ComponentName/   # PascalCase
├── api/                # API関連
├── types/              # 型定義
├── config/             # 設定
└── utils/              # ユーティリティ

functions/src/
├── index.ts            # エントリーポイント
├── types.ts            # 型定義
└── *.ts                # 機能別ファイル
```

#### 命名規約
- **コンポーネント**: PascalCase
- **関数・変数**: camelCase
- **型定義**: PascalCase
- **ファイル**: kebab-case（設定）、PascalCase（コンポーネント）

## パフォーマンス考慮事項

### フロントエンド最適化
- **React.memo**: 適切なメモ化
- **useMemo/useCallback**: 重い計算・関数のメモ化
- **動的インポート**: 必要に応じてコード分割

### バックエンド最適化
- **軽量な依存関係**: コールドスタート対策
- **適切なエラーハンドリング**: レスポンス時間短縮
- **リージョン指定**: asia-northeast1で低レイテンシ

## セキュリティ要件

### 認証・認可
- Firebase IDトークンによる認証必須
- メールアドレスベースのアクセス制御
- 環境変数による機密情報管理

### データ保護
- 入力値検証の実装
- エラー情報の適切な隠蔽
- HTTPS通信の強制

## 依存関係管理

### 更新方針
- **メジャーバージョン**: 慎重に検討
- **マイナーバージョン**: 定期的に更新
- **パッチバージョン**: 積極的に更新

### 新規依存関係追加基準
1. 既存機能で代替できないか検討
2. バンドルサイズへの影響を評価
3. メンテナンス状況を確認
4. TypeScript対応状況を確認

この技術スタック定義に従って、一貫性のある技術選択を行ってください。