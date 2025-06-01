# times_esa バックエンド検索機能一般化計画

## 背景

times_esa_mcp_serverで実装された検索機能の一般化をtimes_esaのバックエンド（Firebase Functions）にも適用する。これにより、過去の日報閲覧機能などの新機能が効率的に実装可能になる。

## 現在の実装の問題点

### テストコードの不在（最重要課題）
- Firebase Functionsにテストコードが一切存在しない
- リファクタリング時に既存機能の動作保証ができない
- APIリクエスト/レスポンスの仕様が文書化されていない
- エラーケースの動作が不明確

### 機能面の制限

1. **検索機能が限定的**
   - カテゴリの部分一致検索のみ
   - 日付範囲での絞り込み不可
   - ページネーション未対応

2. **関数が単一目的に特化**
   - `getDailyReport`: 特定日の日報取得専用
   - `createOrUpdatePost`: 日報作成・更新専用
   - 汎用的な検索機能が存在しない

3. **APIクエリパラメータの活用不足**
   - esa.io APIの豊富な検索オプションを使っていない

## 設計方針

### 1. 検索オプションの型定義

```typescript
// 検索設定を保持する型
type SearchConfig = {
  query?: string;
  categoryQuery?: string;  // カテゴリ検索専用（排他的）
  page?: number;
  perPage?: number;
  sort?: 'created' | 'updated' | 'number' | 'stars' | 'comments' | 'best_match';
  order?: 'asc' | 'desc';
}

// 検索オプションビルダーの型
type SearchOption = (config: SearchConfig) => void;
```

### 2. 検索オプション関数

times_esa_mcp_serverと同様の関数群を提供：

```typescript
// カテゴリ検索
export const withCategory = (category: string): SearchOption => 
  (config) => { config.categoryQuery = `category:${category}`; };

export const withCategoryExact = (category: string): SearchOption => 
  (config) => { config.categoryQuery = `on:${category}`; };

export const withCategoryPrefix = (category: string): SearchOption => 
  (config) => { config.categoryQuery = `in:${category}`; };

// タグ検索
export const withTags = (...tags: string[]): SearchOption => 
  (config) => {
    tags.forEach(tag => {
      config.query = config.query ? `${config.query} tag:${tag}` : `tag:${tag}`;
    });
  };

// 日付範囲検索
export const withDateRange = (
  field: 'created' | 'updated',
  from?: Date,
  to?: Date
): SearchOption => (config) => {
  if (from) {
    const fromStr = from.toISOString().split('T')[0];
    config.query = config.query 
      ? `${config.query} ${field}:>${fromStr}` 
      : `${field}:>${fromStr}`;
  }
  if (to) {
    const toStr = to.toISOString().split('T')[0];
    config.query = config.query 
      ? `${config.query} ${field}:<${toStr}` 
      : `${field}:<${toStr}`;
  }
};

// ページネーション
export const withPagination = (page: number, perPage: number): SearchOption => 
  (config) => {
    config.page = page;
    config.perPage = perPage;
  };

// ソート
export const withSort = (
  sort: SearchConfig['sort'], 
  order: SearchConfig['order'] = 'desc'
): SearchOption => (config) => {
  config.sort = sort;
  config.order = order;
};
```

### 3. 汎用検索関数

```typescript
async function searchPosts(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  options: SearchOption[] = []
): Promise<EsaSearchResult> {
  // デフォルト設定
  const config: SearchConfig = {
    page: 1,
    perPage: 20,
    sort: 'updated',
    order: 'desc'
  };

  // オプションを適用
  options.forEach(option => option(config));

  // クエリパラメータの構築
  const params: any = {};
  
  // クエリ文字列の構築
  const queryParts: string[] = [];
  if (config.categoryQuery) {
    queryParts.push(config.categoryQuery);
  }
  if (config.query) {
    queryParts.push(config.query);
  }
  if (queryParts.length > 0) {
    params.q = queryParts.join(' ');
  }
  
  if (config.page) params.page = config.page;
  if (config.perPage) params.per_page = config.perPage;
  if (config.sort) params.sort = config.sort;
  if (config.order) params.order = config.order;

  // APIリクエスト
  const response = await axios.get<EsaSearchResult>(
    `/v1/teams/${esaConfig.teamName}/posts`,
    { params }
  );
  
  return response.data;
}
```

### 4. 新しいFirebase Functions

#### 汎用検索エンドポイント

```typescript
type SearchPostsRequest = {
  options: {
    type: string;
    value: any;
  }[];
}

export const searchPosts = onCall(
  { secrets: ESA_SECRETS },
  async (req: CallableRequest<SearchPostsRequest>) => {
    checkAuthTokenEmail(req);
    
    const esaConfig = getEsaConfig();
    const axios = createAxiosClient(esaConfig.accessToken);
    
    // クライアントからのオプションを変換
    const searchOptions = req.data.options.map(opt => {
      switch (opt.type) {
        case 'category':
          return withCategory(opt.value as string);
        case 'categoryExact':
          return withCategoryExact(opt.value as string);
        case 'tags':
          return withTags(...(opt.value as string[]));
        case 'dateRange':
          const { field, from, to } = opt.value;
          return withDateRange(
            field,
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined
          );
        case 'pagination':
          const { page, perPage } = opt.value;
          return withPagination(page, perPage);
        default:
          throw new functions.https.HttpsError(
            'invalid-argument',
            `Unknown option type: ${opt.type}`
          );
      }
    });
    
    const result = await searchPosts(axios, esaConfig, searchOptions);
    return result;
  }
);
```

#### 最近の日報リスト取得

```typescript
type RecentReportsRequest = {
  limit?: number;
  offset?: number;
}

export const recentReports = onCall(
  { secrets: ESA_SECRETS },
  async (req: CallableRequest<RecentReportsRequest>) => {
    checkAuthTokenEmail(req);
    
    const esaConfig = getEsaConfig();
    const axios = createAxiosClient(esaConfig.accessToken);
    
    // 現在の年月を取得
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // 最近3ヶ月分のカテゴリを検索
    const categoryQueries: string[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentYear, currentMonth - i - 1, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      categoryQueries.push(`category:日報/${year}/${String(month).padStart(2, '0')}`);
    }
    
    const result = await searchPosts(axios, esaConfig, [
      (config) => { config.query = categoryQueries.join(' OR '); },
      withPagination(1, req.data.limit || 10),
      withSort('updated', 'desc')
    ]);
    
    // タイトルと日付のみを返す
    return {
      reports: result.posts.map(post => ({
        number: post.number,
        name: post.name,
        category: post.category,
        updated_at: post.updated_at
      })),
      totalCount: result.total_count
    };
  }
);
```

### 5. 既存関数のリファクタリング

`getDailyReport`関数を新しい検索機能を使って書き換え：

```typescript
async function getDailyReport(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: string,
): Promise<EsaPost> {
  const result = await searchPosts(axios, esaConfig, [
    withCategory(category),
    withPagination(1, 1)
  ]);
  
  if (result.total_count === 0) {
    throw new functions.https.HttpsError('not-found', '今日の日報はまだありません');
  } else if (result.total_count > 1) {
    throw new functions.https.HttpsError('already-exists', '複数の日報が存在します');
  } else {
    return axios.get<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${result.posts[0].number}`)
      .then((res: AxiosResponse<EsaPost>) => res.data);
  }
}
```

## 実装手順

### フェーズ0: 既存コードのテスト作成（前提条件）

**重要**: 現在、Firebase Functionsにテストコードが存在しないため、リファクタリング前に既存動作を保証するテストを作成する必要がある。

1. **テスト環境のセットアップ**
   - Vitestをテストフレームワークとして導入（フロントエンドと統一）
   - Firebase Functions Test SDKの設定
   - テストスクリプトをpackage.jsonに追加
   - GitHub Actionsでのテスト自動実行設定

2. **既存エンドポイントのテスト作成**
   - `submitTextToEsa`関数のテスト
     - 正常系：新規投稿作成
     - 正常系：既存投稿更新
     - 異常系：複数投稿エラー
     - 異常系：認証エラー
   - `dailyReport`関数のテスト
     - 正常系：日報取得成功
     - 異常系：日報なし
     - 異常系：複数日報エラー
   - `tagList`関数のテスト
     - 正常系：タグリスト取得

3. **HTTPリクエスト/レスポンスの検証**
   - リクエストパラメータの型検証
   - ESA APIへのリクエスト内容の検証
   - レスポンス形式の検証
   - エラーレスポンスの検証

### フェーズ1: 基礎実装（既存機能に影響なし）

1. **検索オプション関数の実装**
   - `src/searchOptions.ts`を新規作成
   - 各種オプション関数を実装
   - ユニットテストを作成

2. **汎用検索関数の実装**
   - `searchPosts`関数を`index.ts`に追加
   - エラーハンドリングの実装
   - 統合テストを作成

### フェーズ2: 新規エンドポイント追加

3. **汎用検索エンドポイント**
   - `searchPosts` Firebase Function実装
   - リクエスト/レスポンスの型定義
   - 入力検証の実装

4. **最近の日報リスト取得エンドポイント**
   - `recentReports` Firebase Function実装
   - 効率的なクエリ構築
   - レスポンスの最適化

### フェーズ3: 既存コードのリファクタリング

5. **既存関数の移行**
   - `getDailyReport`を新しい検索機能で書き換え
   - `createOrUpdatePost`の検索部分を置き換え
   - 回帰テストの実施

6. **日付パラメータ対応**
   - `dailyReport`関数に日付パラメータを追加
   - 後方互換性の確保

## テスト計画

### フェーズ0で作成する既存コードのテスト

1. **単体テスト（Unit Tests）**
   - 各内部関数のテスト
     - `transformTitle`関数の動作検証
     - `checkAuthTokenEmail`の認証検証
   - モックを使用したESA API呼び出しのテスト
     - axiosのモック化
     - 期待されるリクエストパラメータの検証
     - レスポンスハンドリングの検証

2. **統合テスト（Integration Tests）**
   - Firebase Emulatorを使用した実際のFunction呼び出し
   - エンドツーエンドのリクエスト/レスポンス検証
   - エラーハンドリングの動作確認

### 新規実装のテスト

1. **ユニットテスト**
   - 各検索オプション関数のテスト
   - クエリ文字列の生成確認
   - エラーケースのテスト

2. **統合テスト**
   - Firebase Emulatorを使用したテスト
   - 実際のAPIレスポンスの検証
   - パフォーマンステスト

3. **E2Eテスト**
   - フロントエンドとの連携テスト
   - 既存機能の回帰テスト

## セキュリティ考慮事項

1. **認証・認可**
   - 既存の`checkAuthTokenEmail`を継続使用
   - 新規エンドポイントでも同様の認証チェック

2. **入力検証**
   - ページ番号、件数の上限チェック
   - 日付フォーマットの検証
   - SQLインジェクション対策（エスケープ処理）

3. **レート制限**
   - Firebase Functionsのレート制限設定
   - 大量データ取得の防止

## 移行計画

1. **段階的リリース**
   - まず新機能を追加（既存機能は変更なし）
   - 動作確認後、既存機能を新実装に移行
   - 古い実装を段階的に削除

2. **後方互換性**
   - 既存のクライアントコードが動作することを保証
   - APIレスポンスの形式を維持
   - 非推奨の警告を追加（必要に応じて）

## CI/CD設定

### GitHub Actionsの設定

既存の`check_firebase_cloud_function.yaml`を拡張して、テストも実行するように設定：

```yaml
name: Firebase Cloud Function部分の確認

on: [push]

jobs:
  check_firebase_cloud_function:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
        working-directory: ./functions
      - run: npm --prefix functions run lint
      - run: npm --prefix functions run build
      # テストステップを追加
      - run: npm --prefix functions run test
        env:
          # Firebase関連の環境変数（必要に応じて）
          FIREBASE_CONFIG: ${{ secrets.FIREBASE_CONFIG }}
```

### テストスクリプトの追加

`functions/package.json`に以下を追加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### CI/CDパイプラインのメリット

1. **継続的な品質保証**
   - プッシュ時に自動でテスト実行
   - 破壊的変更の早期発見
   - マージ前の品質チェック

2. **開発効率の向上**
   - ローカルでのテスト忘れを防止
   - 複数人開発での品質維持
   - リファクタリング時の安心感

## 今後の拡張可能性

1. **高度な検索機能**
   - 全文検索
   - 複雑なOR条件
   - 正規表現検索

2. **パフォーマンス最適化**
   - 検索結果のキャッシング
   - インデックスの活用
   - バッチ処理の実装

3. **分析機能**
   - 検索結果の集計
   - トレンド分析
   - レポート生成