---
inclusion: always
---

# times_esa プロジェクト構造

## ディレクトリ構造

### ルートディレクトリ
```
times_esa/
├── .github/workflows/      # GitHub Actions
├── .kiro/                 # Kiro設定・スペック
│   ├── steering/          # ステアリングルール
│   └── specs/            # 機能スペック
├── docs/                 # プロジェクトドキュメント
├── functions/            # Firebase Cloud Functions
├── src/                  # フロントエンドソースコード
├── types/                # 共有型定義
├── dist/                 # ビルド成果物
└── node_modules/         # 依存関係
```

### フロントエンド構造 (src/)
```
src/
├── components/           # Reactコンポーネント
│   ├── App.tsx          # ルートコンポーネント
│   ├── Body/            # メインコンテンツ
│   ├── TimesEsa/        # メインアプリ
│   ├── DailyReport/     # 日報表示
│   ├── EsaSubmitForm/   # 投稿フォーム
│   ├── DailyReportsList/ # 日報一覧
│   └── [ComponentName]/ # 各コンポーネント
│       ├── index.tsx    # メインファイル
│       └── *.tsx        # サブコンポーネント
├── api/                 # API関連
│   ├── index.ts         # エクスポート
│   ├── client.ts        # APIクライアント
│   ├── types.ts         # API型定義
│   └── mockData.ts      # モックデータ
├── types/               # フロントエンド型定義
│   ├── index.ts         # 基本型
│   └── components.ts    # コンポーネントProps型
├── config/              # 設定
│   └── index.ts         # 環境変数設定
├── firebase/            # Firebase設定
│   └── index.ts         # Firebase初期化
└── util.ts              # ユーティリティ関数
```

### バックエンド構造 (functions/)
```
functions/
├── src/                 # ソースコード
│   ├── index.ts         # エントリーポイント
│   ├── types.ts         # 型定義
│   ├── caseConverter.ts # データ変換
│   ├── dateUtils.ts     # 日付ユーティリティ
│   ├── search.ts        # 検索機能
│   └── *.ts             # 機能別ファイル
├── lib/                 # コンパイル済みJS
├── __tests__/           # テストファイル
└── package.json         # 依存関係
```

### 共有型定義 (types/)
```
types/
├── api.ts               # API型定義
└── domain.ts            # ドメイン型定義
```

## ファイル命名規約

### コンポーネントファイル
```
// ✅ 推奨パターン
src/components/MyComponent/index.tsx     # メインコンポーネント
src/components/MyComponent/SubItem.tsx   # サブコンポーネント
src/components/MyComponent/types.ts      # コンポーネント固有型
```

### 一般ファイル
```
// ✅ 推奨パターン
api-client.ts           # kebab-case（設定・API）
dateUtils.ts            # camelCase（ユーティリティ）
types.ts                # 小文字（型定義）
MyComponent.tsx         # PascalCase（コンポーネント）
```

### テストファイル
```
MyComponent.test.tsx    # コンポーネントテスト
apiClient.test.ts       # 関数テスト
```

## インポート規約

### インポート順序
```typescript
// 1. React関連
import React, { useState, useEffect } from 'react';

// 2. 外部ライブラリ
import { Button, Box } from '@mui/material';
import { format } from 'date-fns';

// 3. 内部モジュール（絶対パス）
import { apiClient } from '../../api/client';
import { MyComponentProps } from '../../types/components';

// 4. 相対インポート
import './MyComponent.css';
```

### エクスポート規約
```typescript
// ✅ 名前付きエクスポート（推奨）
export const MyComponent: React.FC<Props> = () => {};

// ✅ デフォルトエクスポート（index.tsxのみ）
export default MyComponent;

// ✅ 型のエクスポート
export type { MyComponentProps };
```

## アーキテクチャパターン

### コンポーネント設計
```typescript
// ✅ 標準パターン
const MyComponent: React.FC<MyComponentProps> = (props) => {
  // 1. Hooks
  const [state, setState] = useState<StateType>(initialValue);
  
  // 2. イベントハンドラー
  const handleClick = useCallback((e: React.MouseEvent) => {
    // 処理
  }, []);
  
  // 3. 副作用
  useEffect(() => {
    // 処理
  }, []);
  
  // 4. JSX
  return (
    <Box sx={{ /* styles */ }}>
      {/* JSX */}
    </Box>
  );
};
```

### API呼び出しパターン
```typescript
// ✅ フロントエンド側
import { getDailyReport } from '../api';

const result = await getDailyReport(category);

// ✅ API層
export const getDailyReport = (category: string) => {
  return apiClient.getDailyReport(category);
};

// ✅ クライアント層
class ApiClient {
  async getDailyReport(category: string) {
    // 実装
  }
}
```

### Cloud Functions パターン
```typescript
// ✅ 標準パターン
export const myFunction = onCall(
  { secrets: REQUIRED_SECRETS },
  async (req: CallableRequest<RequestType>) => {
    // 1. 認証チェック
    checkAuthTokenEmail(req);
    
    // 2. バリデーション
    validateRequest(req.data);
    
    // 3. ビジネスロジック
    const result = await processData(req.data);
    
    // 4. レスポンス変換
    return convertToCamelCase(result);
  }
);
```

## 型定義パターン

### Props型定義
```typescript
// ✅ src/types/components.ts
export type MyComponentProps = {
  title: string;
  isVisible?: boolean;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}
```

### API型定義
```typescript
// ✅ types/api.ts
export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
}

export type DailyReportResponse = ApiResponse<EsaPost>;
```

### ドメイン型定義
```typescript
// ✅ types/domain.ts
export type DailyReportCategory = string;
export type DateString = string;
```

## 設定ファイル構造

### 環境設定
```typescript
// ✅ src/config/index.ts
export const config = {
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
  firebase: {
    apiKey: import.meta.env.VITE_API_KEY,
    // ...
  },
} as const;
```

### Firebase設定
```typescript
// ✅ src/firebase/index.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { config } from '../config';

const app = initializeApp(config.firebase);
export const firebaseAuth = getAuth(app);
```

## テスト構造

### テストファイル配置
```
src/components/MyComponent/
├── index.tsx
├── MyComponent.test.tsx    # コンポーネントテスト
└── utils.test.ts          # ユーティリティテスト

functions/src/
├── index.ts
└── __tests__/
    ├── index.test.ts      # 関数テスト
    └── utils.test.ts      # ユーティリティテスト
```

### テスト命名
```typescript
// ✅ テスト構造
describe('MyComponent', () => {
  describe('正常系', () => {
    it('should render correctly', () => {});
    it('should handle click event', () => {});
  });
  
  describe('異常系', () => {
    it('should handle error case', () => {});
  });
});
```

## ドキュメント構造

### プロジェクトドキュメント
```
docs/
├── architecture.md         # アーキテクチャ概要
├── developer-guide.md      # 開発者ガイド
├── api-specification.md    # API仕様書
├── component-specification.md # コンポーネント仕様書
└── deployment-guide.md     # デプロイメントガイド
```

### Kiro設定
```
.kiro/
├── steering/              # ステアリングルール
│   ├── product.md         # プロダクト概要
│   ├── tech.md           # 技術スタック
│   ├── structure.md      # プロジェクト構造
│   ├── architecture-constraints.md # アーキテクチャ制約
│   └── development-standards.md    # 開発標準
└── specs/                # 機能スペック
    └── [feature-name]/   # 機能別スペック
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

この構造に従って、一貫性のあるプロジェクト管理を行ってください。