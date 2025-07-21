---
inclusion: fileMatch
fileMatchPattern: 'functions/**/*'
---

# バックエンド開発ルール

このルールはバックエンド（functions/配下）のファイルを編集する時に適用されます。

## 参照ドキュメント

バックエンド開発時は以下の仕様を必ず参照してください：

- #[[file:docs/api-specification.md]] - API設計仕様
- #[[file:docs/architecture.md]] - システム全体アーキテクチャ

## バックエンド制約

### 必須パターン
- **Cloud Functions**: onCall関数 + TypeScript
- **認証**: 必ず `checkAuthTokenEmail(req)` を実装
- **エラーハンドリング**: 統一されたパターンを使用
- **レスポンス**: キャメルケース形式で返却

### 必須実装
```typescript
export const myFunction = onCall(
  { secrets: REQUIRED_SECRETS },
  async (req: CallableRequest<RequestType>) => {
    // 1. 認証チェック（必須）
    checkAuthTokenEmail(req);

    // 2. バリデーション
    // 3. ビジネスロジック
    // 4. レスポンス変換（キャメルケース）
    return convertToCamelCase(result);
  }
);
```

### 禁止事項
- Express等の独自サーバー構築
- 直接的なデータベース操作
- 独自認証システムの実装
- 認証チェックの省略

### esa.io API連携
- Axiosクライアントを使用
- 適切なエラーハンドリング
- レート制限の考慮

### リージョン・パフォーマンス
- asia-northeast1 リージョンで実行
- 軽量な依存関係でコールドスタート対策
- 適切なタイムアウト設定
