# times_esa API仕様書

## 概要

times_esaのバックエンドは、Firebase Cloud Functionsで構築されており、esa.io APIとの連携を行います。すべてのエンドポイントはHTTPS Callable Functionsとして実装されています。

## 認証

すべてのAPIエンドポイントは、Firebase Authenticationによる認証が必要です。

### 認証方式
- **Firebase ID Token** - リクエストヘッダーに含める
- **メールアドレス検証** - 環境変数`VALID_EMAIL`で指定されたメールアドレスのみアクセス可能

### エラーレスポンス
認証に失敗した場合：
```json
{
  "error": "permission-denied",
  "message": "Auth Error"
}
```

## エンドポイント一覧

| エンドポイント | 機能 | 説明 |
|---------------|------|------|
| `submitTextToEsa` | 投稿作成・更新 | esa.ioに日報を投稿または既存投稿を更新 |
| `dailyReport` | 日報取得 | 指定日の日報を取得 |
| `tagList` | タグ一覧取得 | esa.ioのタグ一覧を取得 |
| `recentDailyReports` | 最近の日報一覧 | 最近の日報リストを取得 |

## API詳細仕様

### 1. submitTextToEsa

esa.ioに日報を投稿または既存投稿を更新します。

#### リクエスト

```typescript
type SubmitTextRequest = {
  category: string;    // 日報カテゴリ（例: "日報/2024/01/20"）
  tags: string[];      // タグの配列
  title: string;       // 投稿タイトル
  text: string;        // 投稿本文（Markdown）
}
```

#### レスポンス

```typescript
type SubmitTextResponse = {
  bodyMd: string;      // Markdown本文
  bodyHtml: string;    // HTML本文
  number: number;      // 投稿番号
  name: string;        // 投稿タイトル
  tags: string[];      // タグ配列
  updatedAt: string;   // 更新日時（ISO 8601）
  url: string;         // 投稿URL
  category: string;    // カテゴリ
}
```

#### 動作仕様

1. **既存投稿の検索**: 指定されたカテゴリで既存投稿を検索
2. **新規作成**: 投稿が存在しない場合、新規作成
3. **更新**: 投稿が存在する場合、以下のルールで更新：
   - **タイトル**: 既存タイトルと新タイトルをマージ（重複除去）
   - **タグ**: 既存タグと新タグをマージ（重複除去）
   - **本文**: 新しい本文を既存本文の前に追加
4. **並行編集対応**: 複数セッションからの同時編集を適切にマージ

#### エラーケース

```json
// 複数の日報が存在する場合
{
  "error": "already-exists",
  "message": "複数の日報が存在します"
}

// esa.io APIエラー
{
  "error": "invalid-argument", 
  "message": "Bad Request: Invalid category format"
}
```

### 2. dailyReport

指定された日の日報を取得します。

#### リクエスト

```typescript
type DailyReportRequest = {
  category: string;    // 日報カテゴリ（例: "日報/2024/01/20"）
}
```

#### レスポンス

```typescript
type DailyReportResponse = {
  bodyMd: string;      // Markdown本文
  bodyHtml: string;    // HTML本文
  number: number;      // 投稿番号
  name: string;        // 投稿タイトル
  tags: string[];      // タグ配列
  updatedAt: string;   // 更新日時（ISO 8601）
  url: string;         // 投稿URL
  category: string;    // カテゴリ
}
```

#### エラーケース

```json
// 日報が存在しない場合
{
  "error": "not-found",
  "message": "指定された日の日報はまだありません"
}

// 複数の日報が存在する場合
{
  "error": "already-exists",
  "message": "複数の日報が存在します"
}

// カテゴリ形式エラー
{
  "error": "invalid-argument",
  "message": "カテゴリの形式が正しくありません"
}
```

### 3. tagList

esa.ioのタグ一覧を取得します。

#### リクエスト

```typescript
type TagListRequest = {}  // パラメータなし
```

#### レスポンス

```typescript
type TagListResponse = {
  tags: Array<{
    name: string;        // タグ名
    postsCount: number;  // 投稿数
  }>;
  totalCount: number;    // 総タグ数
}
```

#### エラーケース

```json
// esa.io APIエラー
{
  "error": "internal",
  "message": "タグリストの取得中にエラーが発生しました"
}
```

### 4. recentDailyReports

最近の日報一覧を取得します。

#### リクエスト

```typescript
type RecentDailyReportsRequest = {
  days?: number;       // 取得する日数（1-31、デフォルト: 10）
}
```

#### レスポンス

```typescript
type RecentDailyReportsResponse = {
  reports: Array<{
    date: string;        // 日付（YYYY-MM-DD）
    title: string;       // 投稿タイトル
    tags: string[];      // タグ配列
    category: string;    // カテゴリ
    updatedAt: string;   // 更新日時（ISO 8601）
    number: number;      // 投稿番号
  }>;
  totalCount: number;    // 総件数
}
```

#### パラメータ制限

- `days`: 1〜31の範囲で指定
- デフォルト値: 10日

#### エラーケース

```json
// パラメータ範囲エラー
{
  "error": "invalid-argument",
  "message": "daysパラメータは1から31の範囲で指定してください"
}

// 内部エラー
{
  "error": "internal",
  "message": "日報リストの取得中にエラーが発生しました"
}
```

## データ変換仕様

### タイトルマージロジック

`submitTextToEsa`での並行編集時のタイトルマージ仕様：

```typescript
// 例: 既存タイトル「開発、設計」+ 新タイトル「開発、テスト」
// 結果: 「開発、設計、テスト」（重複除去、「日報」は特別扱い）

function transformTitle(oldTitle: string, newTitle: string): string {
  const result = Array.from(new Set(
    oldTitle.split(/,\s?|、/).concat(newTitle.split(/,\s?|、/))
  )).filter(item => item !== '');
  
  if (result.length === 1 && result[0] === '日報') {
    return '日報';
  }
  
  return result.filter(item => item !== '日報').join('、');
}
```

### 日付・カテゴリ変換

```typescript
// 日付からカテゴリへの変換
// "2024-01-20" → "日報/2024/01/20"

// カテゴリから日付への変換  
// "日報/2024/01/20" → "2024-01-20"
```

## 外部API連携

### esa.io API

**ベースURL**: `https://api.esa.io`

#### 使用エンドポイント

| エンドポイント | 用途 |
|---------------|------|
| `GET /v1/teams/{team}/posts` | 投稿検索 |
| `POST /v1/teams/{team}/posts` | 投稿作成 |
| `PATCH /v1/teams/{team}/posts/{number}` | 投稿更新 |
| `GET /v1/teams/{team}/tags` | タグ一覧取得 |

#### 認証

```
Authorization: Bearer {ESA_ACCESS_TOKEN}
```

#### 検索クエリ仕様

```
# カテゴリ完全一致
on:日報/2024/01/20

# カテゴリ前方一致  
in:日報/2024/01

# タグ検索
tag:開発

# OR検索
on:日報/2024/01/20 OR on:日報/2024/01/21
```

## エラーハンドリング

### エラー分類

1. **認証エラー** (`permission-denied`)
   - 無効なFirebase IDトークン
   - 許可されていないメールアドレス

2. **バリデーションエラー** (`invalid-argument`)
   - 不正なパラメータ形式
   - 範囲外の値

3. **データ不整合エラー** (`already-exists`, `not-found`)
   - 複数の日報存在
   - 日報が見つからない

4. **外部APIエラー** (`internal`)
   - esa.io APIエラー
   - ネットワークエラー

### エラーレスポンス形式

```typescript
type ErrorResponse = {
  error: string;    // エラーコード
  message: string;  // エラーメッセージ（日本語）
}
```

## パフォーマンス特性

### レスポンス時間

- **submitTextToEsa**: 1-3秒（esa.io API依存）
- **dailyReport**: 0.5-1.5秒
- **tagList**: 0.5-1秒
- **recentDailyReports**: 1-2秒（検索範囲依存）

### レート制限

esa.io APIのレート制限に準拠：
- 1時間あたり5,000リクエスト
- 1分あたり300リクエスト

## セキュリティ

### 入力値検証

- SQLインジェクション対策（esa.io API経由のため影響限定的）
- XSS対策（Markdown内容のサニタイゼーション）
- パラメータ範囲チェック

### 機密情報管理

- 環境変数による設定管理
- esa.io アクセストークンの適切な管理
- エラー情報の適切な隠蔽