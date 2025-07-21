---
inclusion: always
---

# times_esa プロジェクト構造

詳細な構造とパターンについては以下のドキュメントを参照してください：

- #[[file:docs/architecture.md]] - システム全体構成
- #[[file:docs/component-specification.md]] - コンポーネント構造詳細

## 基本構造

```
times_esa/
├── .kiro/               # Kiro設定・スペック
├── docs/                # プロジェクトドキュメント
├── src/                 # フロントエンド
│   ├── components/      # Reactコンポーネント
│   ├── api/            # API関連
│   └── types/          # 型定義
├── functions/          # Firebase Cloud Functions
└── types/              # 共有型定義
```

## 命名・パターン規約

詳細なパターンと規約については：
- #[[file:docs/developer-guide.md]] - 開発フロー・コーディング規約
- #[[file:docs/component-specification.md]] - コンポーネント設計パターン

### 必須命名規約
- **コンポーネント**: PascalCase (`MyComponent.tsx`)
- **関数・変数**: camelCase (`handleClick`)
- **型定義**: PascalCase (`MyComponentProps`)
- **ファイル**: kebab-case（設定）、PascalCase（コンポーネント）

### 必須パターン
- **React**: 関数コンポーネント + TypeScript
- **API**: `src/api/client.ts` パターン踏襲
- **Cloud Functions**: onCall + 認証チェック必須
- **型定義**: `src/types/components.ts` に集約
