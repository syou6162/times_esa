# Firebase Functions → Golang + Cloud Run + IAP 移行計画

## 現状分析

### 現在のアーキテクチャ
- **Runtime**: Node.js + TypeScript
- **Framework**: Firebase Functions v2 (onCall)
- **認証**: Firebase Auth Token検証
- **Secret管理**: Firebase Functions secrets
- **リージョン**: asia-northeast1
- **エンドポイント**: 3つのCallable Functions

### 主要機能
1. `submitTextToEsa`: esa.io投稿作成/更新
2. `dailyReport`: 日次レポート取得
3. `tagList`: タグ一覧取得

## 移行先アーキテクチャ

### 技術スタック
- **Runtime**: Golang 1.21+
- **Framework**: 標準ライブラリ (`net/http`, `encoding/json`)
- **認証**: Google IAP (Identity-Aware Proxy)
- **Secret管理**: Google Secret Manager
- **コンテナ**: Docker
- **デプロイ**: Cloud Run
- **リージョン**: asia-northeast1

### IAP認証フロー
```
Client → IAP → Cloud Run
       ↓
   JWT Header (X-Goog-IAP-JWT-Assertion)
   User Info Header (X-Goog-Authenticated-User-Email)
```

## 実装計画

### 1. プロジェクト構造
```
backend-go/
├── main.go
├── handlers/
│   ├── esa.go
│   ├── daily_report.go
│   └── tag_list.go
├── models/
│   └── esa.go
├── services/
│   └── esa_client.go
├── middleware/
│   └── auth.go
├── Dockerfile
├── go.mod
└── go.sum
```

### 2. 重要な実装ポイント

#### A. 認証ミドルウェア
```go
// 現在: checkAuthTokenEmail(context)
// 移行後: IAP Headerからメール取得
func authMiddleware(validEmail string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            email := r.Header.Get("X-Goog-Authenticated-User-Email")
            // accounts.google.com:example@gmail.com -> example@gmail.com
            email = strings.TrimPrefix(email, "accounts.google.com:")
            
            if email != validEmail {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
```

#### B. HTTP API変換
```typescript
// 現在: Firebase Callable Functions
const result = await httpsCallable(functions, 'submitTextToEsa')({
  category: "日報/2024/01",
  tags: ["times"],
  title: "作業メモ",
  text: "今日やったこと"
});

// 移行後: REST API
const response = await fetch('/api/submit-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: "日報/2024/01",
    tags: ["times"],
    title: "作業メモ",
    text: "今日やったこと"
  })
});
```

#### C. エラーハンドリング変換
```typescript
// 現在: functions.https.HttpsError
throw new functions.https.HttpsError('not-found', '今日の日報はまだありません');

// 移行後: HTTP Status + JSON
{
  "error": "not_found",
  "message": "今日の日報はまだありません"
}
```

### 3. 重要な移行ポイント

#### A. Secret管理の変更
```go
// 現在: Firebase Functions secrets
// { secrets: ESA_SECRETS}

// 移行後: Google Secret Manager
import "cloud.google.com/go/secretmanager/apiv1"

func getSecret(projectID, secretID string) (string, error) {
    ctx := context.Background()
    client, err := secretmanager.NewClient(ctx)
    if err != nil {
        return "", err
    }
    defer client.Close()
    
    accessRequest := &secretmanagerpb.AccessSecretVersionRequest{
        Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, secretID),
    }
    
    result, err := client.AccessSecretVersion(ctx, accessRequest)
    if err != nil {
        return "", err
    }
    
    return string(result.Payload.Data), nil
}
```

#### B. フロントエンドの変更箇所
```typescript
// 変更が必要なファイル:
// - src/firebase/index.ts: Firebase Functions参照を削除
// - src/components/EsaSubmitForm/index.tsx: 投稿API呼び出し
// - src/components/DailyReport/index.tsx: 日報取得API呼び出し
// - src/components/EsaTagsField/index.tsx: タグ取得API呼び出し

// 現在: 
import { httpsCallable } from 'firebase/functions';
const submitFunction = httpsCallable(functions, 'submitTextToEsa');

// 移行後:
const submitToEsa = async (data) => {
  const response = await fetch('/api/submit-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

## 注意点・リスク

### 1. 認証の変更影響
- **リスク**: Firebase Authからの完全移行で既存ユーザーセッションが無効化
- **対策**: 段階的移行 or ユーザーに再ログイン案内
- **テスト**: IAPの動作確認（特にGoogle Workspaceドメイン制限）

### 2. API仕様の変更
- **現在**: Firebase Callable Functionsは自動的にJSON-RPCライクな仕様
- **移行後**: REST APIの設計が必要
- **影響**: フロントエンドのエラーハンドリング全面見直し

### 3. デプロイメント変更
```yaml
# 現在: Firebase Functions
firebase deploy --only functions

# 移行後: Cloud Run
gcloud run deploy times-esa-backend \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated=false \  # IAP使用時
  --ingress=all
```

### 4. コールドスタート性能
- **Firebase Functions**: Node.js起動 + 依存関係読み込み
- **Cloud Run + Go**: バイナリ実行のため高速化期待
- **注意**: GoのHTTPサーバー初期化コストは考慮必要

### 5. ログ・モニタリング変更
```go
// 現在: Firebase Functions自動ログ
functions.logger.info("投稿完了", { postId: result.number });

// 移行後: Cloud Logging
import "cloud.google.com/go/logging"
logger.Log(logging.Entry{
    Severity: logging.Info,
    Payload:  map[string]interface{}{"message": "投稿完了", "postId": result.number},
})
```

## 実装順序

### Phase 1: Backend開発・テスト (2-3時間)
1. Golangプロジェクト初期化
2. esa.io APIクライアント実装
3. 3つのエンドポイント実装
4. IAP認証ミドルウェア実装
5. Secret Manager連携
6. ローカルテスト環境構築

### Phase 2: インフラ構築 (1時間)
1. Cloud Run設定
2. IAP設定（許可ユーザー登録）
3. Secret Manager設定
4. デプロイパイプライン構築

### Phase 3: フロントエンド変更 (1-2時間)
1. Firebase Functions依存削除
2. REST API呼び出しに変更
3. エラーハンドリング更新
4. 認証フロー変更（Firebase Auth削除検討）

### Phase 4: 移行・テスト (1時間)
1. 段階的切り替え（DNS/Load Balancer）
2. 機能テスト
3. パフォーマンステスト
4. 旧システム停止

## 検討事項

### 1. Firebase Authを残すか？
- **残す場合**: フロントエンドの認証UIはそのまま、バックエンドのみ変更
- **削除する場合**: Google OAuthに完全移行、よりシンプルな構成

### 2. レスポンス形式統一
```go
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *APIError   `json:"error,omitempty"`
}

type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
}
```

### 3. 開発・テスト環境
- **開発**: ローカル環境でのIAP無効化（環境変数で制御）
- **テスト**: 専用Cloud Runインスタンス + 別IAP設定
- **本番**: 既存ドメイン + IAP

### 4. 依存関係最小化
```go
// 使用予定ライブラリ（最小構成）
- 標準ライブラリのみ (net/http, encoding/json)
- cloud.google.com/go/secretmanager (Secret管理)
- github.com/gorilla/mux (ルーティング、必要に応じて)
```

## 期待される効果

### パフォーマンス
- コールドスタート時間短縮（Node.js 500ms → Go 100ms程度）
- メモリ使用量削減（256MB → 128MB程度）
- 実行時間短縮（型安全性・コンパイル済み）

### 運用面
- 認証ロジックの単純化（IAP委譲）
- デバッグの容易さ（Goの静的型付け）
- インフラコスト削減（Cloud Runの効率性）

### セキュリティ
- Google IAPの企業レベルセキュリティ
- 認証コードの削除によるバグリスク軽減
- Google Cloud統一管理によるアクセス制御強化