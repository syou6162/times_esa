# 過去の日報閲覧機能 実装計画

## 背景

現在のtimes_esaは「今日の日報」の表示・編集に特化しているが、実際の利用シーンでは以下のようなニーズがある：

- 月曜日に作業している時、「金曜日は何の作業をしていたっけ？」と確認したい
- 過去の作業内容を振り返って参照したい
- 週報や月報を書く際に、過去の日報を確認したい

これらのニーズに応えるため、過去の日報を閲覧できる機能を追加する。

## 機能要件

### 必須要件
1. **過去の日報の閲覧**
   - 特定の日付の日報を表示できる
   - 過去の日報は読み取り専用（編集不可）
   
2. **日報リストの表示**
   - 直近10件程度の日報リストを表示（タイトルと日付のみ）
   - リストから選択して該当日の日報を表示
   - 日報リストは初回のみ取得し、以降はキャッシュを使用

### 技術的な制約
- 既存の画面（今日の日報の編集機能）に影響を与えない
- 段階的に実装可能な設計にする
- APIの通信量を最小限に抑える（エンドポイントの呼び出し回数を削減）

## UIデザイン案

### 案1: タブ切り替え方式
```
[今日の日報] [過去の日報]
```
- タブで表示モードを切り替え
- 過去の日報タブでは日付選択UIとリストを表示

### 案2: サイドバー方式
- 画面の左側に日報リストを常時表示
- クリックで該当日の日報を表示
- 今日の日報は常に最上部に固定

### 案3: モーダル/ドロワー方式
- 「過去の日報を見る」ボタンでモーダルやドロワーを開く
- 日報リストと詳細表示を含む

## 実装計画

### フェーズ1: バックエンドAPI（既存UIに影響なし）

#### 1. 過去の日報リストを取得するFirebase Function作成
```typescript
// functions/src/index.ts に追加
export const recentReports = onCall(
  { secrets: ESA_SECRETS },
  async (req: CallableRequest<RecentReportsRequest>) => {
    // 実装内容:
    // - 日付範囲を指定してesa.ioから日報を取得
    // - カテゴリ検索: q: "category:日報/2024"
    // - タイトルと日付のみを返す（詳細は含まない）
    // - 結果を日付順にソート
  }
);
```

#### 2. 既存のdailyReport関数を拡張
```typescript
type TimesEsaDailyReportRequest = {
  category: string;
  date?: string; // 新規追加: yyyy-MM-dd形式
}
```

#### 3. 日付範囲での日報取得ロジック
- ESA APIのカテゴリ検索を活用
- `日報/yyyy/MM/dd`形式を利用した効率的な検索

### フェーズ2: フロントエンド基礎実装

#### 4. 日報リスト表示コンポーネント
```typescript
// src/components/RecentReportsList/index.tsx
interface RecentReportsListProps {
  onSelectDate: (date: string) => void;
}
```

#### 5. 日付管理の仕組み
- URLパラメータ: `?date=2024-01-15`
- またはReact Stateで管理

### フェーズ3: UI統合

#### 6. 日付選択コンポーネント
- Material-UIのDatePickerを使用
- 日本語ロケール設定

#### 7. 表示モード切り替え
- 現在の日報と過去の日報の切り替えUI
- 過去の日報では`EsaSubmitForm`を非表示

#### 8. 読み取り専用モード
- 過去の日報は編集不可のメッセージ表示
- 視覚的に編集不可であることを明示

## 実装チェックリスト

### バックエンド実装
- [ ] `recentReports` Firebase Function作成
  - [ ] リクエスト型定義
  - [ ] ESA API呼び出しロジック
  - [ ] エラーハンドリング
  - [ ] テスト作成

- [ ] `dailyReport` 関数の拡張
  - [ ] 日付パラメータ追加
  - [ ] カテゴリ生成ロジックの修正
  - [ ] 後方互換性の確保

- [ ] ユーティリティ関数
  - [ ] 日付からカテゴリへの変換関数
  - [ ] 日付範囲の生成関数

### フロントエンド実装
- [ ] `RecentReportsList` コンポーネント
  - [ ] Props定義
  - [ ] APIコール実装
  - [ ] リスト表示UI
  - [ ] 選択時のコールバック

- [ ] `TimesEsa` コンポーネントの拡張
  - [ ] 日付state管理
  - [ ] 条件付きレンダリング
  - [ ] 読み取り専用モード対応

- [ ] 日付選択UI
  - [ ] DatePickerコンポーネント統合
  - [ ] 日本語設定
  - [ ] バリデーション

### テスト・検証
- [ ] Firebase Functionsのユニットテスト
- [ ] コンポーネントのスナップショットテスト
- [ ] 統合テスト（エンドツーエンド）
- [ ] パフォーマンステスト（大量の日報がある場合）

## 技術的な詳細

### ESA APIの活用
```bash
# カテゴリ検索の例
GET /v1/teams/{team_name}/posts?q=category:日報/2024/01

# 複数カテゴリの検索
GET /v1/teams/{team_name}/posts?q=category:日報/2024/01 OR category:日報/2024/02
```

### 日付フォーマット
- 内部: `yyyy-MM-dd`形式
- ESAカテゴリ: `日報/yyyy/MM/dd`形式
- 表示: `yyyy年MM月dd日`形式

### 状態管理
```typescript
// 現在の表示モード
type ViewMode = 'today' | 'past';

// 選択された日付
type SelectedDate = string | null; // yyyy-MM-dd形式

// 日報リストのキャッシュ
type ReportListCache = {
  data: ReportSummary[];
  fetchedAt: Date;
}
```

### データ取得戦略

1. **遅延読み込み（Lazy Loading）**
   - 今日の日報は従来通り即座に取得・表示
   - 過去の日報リストは必要になったタイミングで初回のみ取得
   - 特定の日付の詳細は、その日付が選択されたときに初めて取得

2. **キャッシュ戦略**
   - 日報リスト：初回ロード時に取得し、セッション中はキャッシュを使用
   - タグ一覧：現在の実装と同様に非同期で取得
   - 個別の日報詳細：一度取得したものはセッション中キャッシュ

3. **APIコール最適化**
   ```typescript
   // 日報リスト取得（タイトルのみ）
   GET /v1/teams/{team_name}/posts?q=category:日報/2024&fields=name,category,updated_at
   
   // 特定日の詳細取得（クリック時）
   GET /v1/teams/{team_name}/posts/{number}
   ```

## 今後の拡張可能性

1. **検索機能**
   - キーワード検索
   - タグでのフィルタリング

2. **集計機能**
   - 週次・月次でのつぶやき数集計
   - タグの利用頻度分析

3. **エクスポート機能**
   - 特定期間の日報をMarkdown/PDFで出力

## 参考資料

- [ESA API ドキュメント](https://docs.esa.io/posts/102)
- [Material-UI DatePicker](https://mui.com/x/react-date-pickers/date-picker/)
- [Firebase Functions ベストプラクティス](https://firebase.google.com/docs/functions/tips)