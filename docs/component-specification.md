# times_esa コンポーネント仕様書

## 概要

times_esaのフロントエンドは、React + TypeScript + Material-UIで構築されています。このドキュメントでは、各コンポーネントの詳細な仕様を説明します。

## コンポーネント階層

```
App
├── Body
│   ├── SignInDialog
│   │   └── StyledFirebaseAuth
│   ├── WelcomeMessage
│   ├── SignOutButton
│   └── TimesEsa
│       ├── DailyReportsSidebar
│       │   └── DailyReportsList
│       │       ├── DailyReportItem
│       │       ├── DailyReportsLoading
│       │       ├── DailyReportsError
│       │       └── DailyReportsEmpty
│       ├── EsaSubmitForm
│       │   ├── EsaTitleField
│       │   ├── EsaTagsField
│       │   └── EsaTextField
│       └── DailyReport
│           ├── DailyReportHtml
│           ├── DailyReportText
│           ├── DailyReportShare
│           └── ShareButtons
│               ├── TweetButton
│               └── CopyButton
└── Footer
    └── SignOutButton
```

## 主要コンポーネント詳細

### App

アプリケーションのルートコンポーネント。認証状態の管理とテーマ設定を行います。

#### 状態管理
```typescript
const [hasUserLanded, setHasUserLanded] = useState<boolean>(false);
const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
const [user, setUser] = useState<GoogleUser>({
  email: '',
  displayName: '',
  photoURL: '',
});
```

#### 主要機能
- Firebase Authentication状態の監視
- モックモード対応
- Material-UI テーマ設定
- 日本語フォント設定

### Body

メインコンテンツの表示制御を行うコンポーネント。

#### Props
```typescript
type BodyProps = {
  hasUserLanded: boolean;
  isSignedIn: boolean;
  user: GoogleUser;
  firebaseAuth: Auth | null;
}
```

#### 表示ロジック
1. **未認証時**: `SignInDialog`を表示
2. **無効ユーザー**: エラーメッセージと`SignOutButton`を表示
3. **有効ユーザー**: `TimesEsa`メインアプリを表示

### TimesEsa

メインアプリケーションコンポーネント。日報の投稿・表示機能を提供します。

#### Props
```typescript
type TimesEsaProps = {
  canFetchCloudFunctionEndpoints: boolean;
}
```

#### 状態管理
```typescript
// API関連
const [fetching, setFetching] = useState<boolean>(false);
const [fetchErrorMessage, setfetchErrorMessage] = useState<string>('');

// 日報データ
const [esaUpdatedAt, setUpdatedAt] = useState<string>('');
const [esaUrl, setEsaUrl] = useState<string>('');
const [esaText, setEsaText] = useState<string>('');
const [esaHtml, setEsaHtml] = useState<string>('');
const [esaTags, setEsaTags] = useState<string[]>([]);
const [esaTitle, setEsaTitle] = useState<string>('日報');
const [esaCategory, setEsaCategory] = useState<string>('');

// UI状態
const [selectedDate, setSelectedDate] = useState<DateString | undefined>(undefined);
const [mobileOpen, setMobileOpen] = useState<boolean>(false);
```

#### レスポンシブ対応
- **デスクトップ**: サイドバー固定表示
- **モバイル**: ドロワー形式のサイドバー
- **ブレークポイント**: Material-UI の `md` (768px)

#### 主要機能
- 日報の読み込み・表示
- タグ候補の取得
- 日付選択による過去日報の表示
- モバイル対応のUI切り替え

### EsaSubmitForm

日報投稿フォームコンポーネント。

#### Props
```typescript
type EsaSubmitFormProps = {
  category: string;
  title: string;
  tags: string[];
  tagCandidates: string[];
  fetching: boolean;
  onSubmit: (category: string, title: string, markdown: string, html: string, tags: string[]) => void;
}
```

#### 状態管理
```typescript
const [sending, setSending] = useState<boolean>(false);
const [category, setCategory] = useState<string>(props.category);
const [title, setTitle] = useState<string>(props.title);
const [text, setText] = useState<string>('');
const [tags, setTags] = useState<string[]>(props.tags);
```

#### 投稿処理
1. **タイムスタンプ生成**: `HH:mm`形式
2. **アンカーリンク作成**: `<a id="HHmm" href="#HHmm">HH:mm</a>`
3. **曜日タグ自動追加**: 投稿日の曜日を自動でタグに追加
4. **タイトル変換**: 改行区切りをカンマ区切りに変換
5. **API呼び出し**: `submitTextToEsa`関数を実行

#### バリデーション
- **同日チェック**: 今日の日報のみ投稿可能
- **送信中の無効化**: 重複送信防止

### DailyReport

日報表示コンポーネント。HTML、テキスト、シェア用の3つの表示モードを提供します。

#### Props
```typescript
type DailyReportProps = {
  fetching: boolean;
  fetchErrorMessage: string;
  esaText: string;
  esaHtml: string;
  reloadDailyReport: () => void;
  isReadOnly?: boolean;
}
```

#### 表示モード
1. **HTML**: esa.ioのHTML形式で表示
2. **TEXT**: プレーンテキスト形式で表示
3. **SHARE**: 個別投稿ごとにシェアボタン付きで表示

#### シェア機能
- **Twitter投稿**: 個別つぶやきをTwitterに投稿
- **クリップボードコピー**: 個別つぶやきをコピー
- **投稿解析**: `---`区切りで個別投稿を分離

### DailyReportsSidebar

過去の日報一覧を表示するサイドバーコンポーネント。

#### Props
```typescript
type DailyReportsSidebarProps = {
  selectedDate?: DateString;
  onDateSelect: (date: DateString, reportInfo: { title: string; tags: string[] }) => void;
  onTodayClick: () => void;
  isMobile: boolean;
}
```

#### 機能
- 過去10日分の日報一覧表示
- 日付選択による日報切り替え
- 今日の日報に戻るボタン
- モバイル対応のレイアウト調整

### DailyReportsList

日報一覧の表示とデータ取得を行うコンポーネント。

#### Props
```typescript
type DailyReportsListProps = {
  selectedDate?: DateString;
  onDateSelect: (date: DateString, reportInfo: { title: string; tags: string[] }) => void;
}
```

#### 状態管理
```typescript
const [reports, setReports] = useState<DailyReportSummary[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

#### 表示状態
- **ローディング**: `DailyReportsLoading`
- **エラー**: `DailyReportsError`
- **空状態**: `DailyReportsEmpty`
- **正常**: `DailyReportItem`のリスト

## フォームコンポーネント

### EsaTitleField

日報タイトル入力フィールド。

#### Props
```typescript
type EsaTitleFieldProps = {
  fetching: boolean;
  sending: boolean;
  title: string;
  onChange: InputChangeHandler;
}
```

#### 特徴
- **複数行対応**: 最大3行まで
- **カーソル制御**: フォーカス時にカーソルを末尾に移動
- **スタイリング**: 白色のアウトライン

### EsaTagsField

タグ入力フィールド（オートコンプリート機能付き）。

#### Props
```typescript
type EsaTagsFieldProps = {
  fetching: boolean;
  sending: boolean;
  tags: string[];
  tagCandidates: string[];
  onChange: AutocompleteChangeHandler<string>;
}
```

#### 機能
- **オートコンプリート**: 既存タグからの候補表示
- **自由入力**: 新しいタグの作成可能
- **チップ表示**: 選択されたタグをチップで表示
- **複数選択**: 複数タグの同時選択

### EsaTextField

日報本文入力フィールド。

#### Props
```typescript
type EsaTextFieldProps = {
  sending: boolean;
  text: string;
  onChange: TextAreaChangeHandler;
}
```

#### 特徴
- **複数行対応**: 6〜30行の可変サイズ
- **プレースホルダー**: 使用方法の説明表示

## 認証関連コンポーネント

### SignInDialog

サインインダイアログコンポーネント。

#### Props
```typescript
type SignInDialogProps = {
  firebaseAuth: Auth | null;
}
```

#### 機能
- Firebase UI による Google認証
- モーダルダイアログ形式

### SignOutButton

サインアウトボタンコンポーネント。

#### Props
```typescript
type SignOutButtonProps = {
  firebaseAuth: Auth | null;
}
```

## 共有コンポーネント

### TweetButton

Twitter投稿ボタン。

#### Props
```typescript
type TweetButtonProps = {
  text: string;
}
```

#### 機能
- Twitter Web Intentを使用した投稿
- 新しいタブで開く

### CopyButton

クリップボードコピーボタン。

#### Props
```typescript
type CopyButtonProps = {
  text: string;
}
```

#### 機能
- `react-copy-to-clipboard`を使用
- コピー完了の視覚的フィードバック

## 型定義

### 基本型

```typescript
// ユーザー情報
type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
}

// 日報表示タイプ
enum DailyReportType {
  HTML = 'HTML',
  TEXT = 'TEXT',
  SHARE = 'SHARE',
}

// イベントハンドラー
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type TextAreaChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
```

### API関連型

```typescript
// 日報サマリー
type DailyReportSummary = {
  date: string;
  title: string;
  tags: string[];
  category: string;
  updatedAt: string;
  number: number;
}

// タグ情報
type Tag = {
  name: string;
  postsCount: number;
}
```

## スタイリング

### テーマ設定

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },
    secondary: { main: '#e0e0e0' },
    success: { main: '#c51162' },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Hiragino Sans"',
      '"Hiragino Kaku Gothic ProN"',
      '"Yu Gothic"',
      'Meiryo',
      'IPAGothic',
      'sans-serif'
    ].join(','),
  },
});
```

### カスタムスタイル

- **入力フィールド**: 白色のアウトライン
- **サイドバー**: ダークテーマ (`#1a1a1a`)
- **レスポンシブ**: Material-UIのブレークポイント使用

## パフォーマンス最適化

### メモ化

```typescript
// DailyReportsList
export const DailyReportsList: React.FC<DailyReportsListProps> = React.memo(({
  selectedDate,
  onDateSelect,
}) => {
  // ...
});
```

### 状態管理

- **ローカル状態**: `useState`を使用
- **副作用**: `useEffect`でAPI呼び出し
- **メモリリーク対策**: クリーンアップ関数の実装

## エラーハンドリング

### API エラー

```typescript
try {
  const result = await apiClient.getRecentDailyReports();
  setReports(result.data.reports);
} catch (err) {
  console.error('Failed to fetch reports:', err);
  setError('日報の一覧を取得できませんでした');
}
```

### ユーザーフィードバック

- **ローディング状態**: `CircularProgress`コンポーネント
- **エラー表示**: `Alert`コンポーネント
- **空状態**: 専用の空状態コンポーネント

## アクセシビリティ

### ARIA属性

- **ボタン**: `aria-label`の設定
- **フォーム**: `required`属性の使用
- **ナビゲーション**: 適切なセマンティクス

### キーボード操作

- **フォーカス管理**: タブ順序の適切な設定
- **フォーム送信**: Enterキーでの送信対応

## 今後の拡張ポイント

### パフォーマンス

- 仮想スクロールの導入（大量データ対応）
- 画像の遅延読み込み
- コンポーネントの分割読み込み

### 機能

- オフライン対応
- プッシュ通知
- テーマ切り替え機能
