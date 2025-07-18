---
inclusion: fileMatch
fileMatchPattern: 'src/**/*'
---

# フロントエンド開発ルール

このルールはフロントエンド（src/配下）のファイルを編集する時に適用されます。

## 参照ドキュメント

フロントエンド開発時は以下の仕様を必ず参照してください：

- #[[file:docs/component-specification.md]] - コンポーネント設計仕様
- #[[file:docs/architecture.md]] - システム全体アーキテクチャ

## フロントエンド制約

### 必須パターン
- **React**: 関数コンポーネント + TypeScript + Hooks
- **Material-UI**: sx prop使用、インラインスタイル禁止
- **状態管理**: React Hooksのみ（外部ライブラリ禁止）
- **型定義**: Props型は `src/types/components.ts` に定義

### 禁止事項
- クラスコンポーネント
- 外部状態管理ライブラリ（Redux, Zustand等）
- any型の使用
- インラインスタイル

### レスポンシブ対応
- Material-UIのブレークポイント（md: 768px）を使用
- モバイル・デスクトップの適切な切り替え

### パフォーマンス
- React.memo、useMemo、useCallbackの適切な使用
- 不要な再レンダリングの防止