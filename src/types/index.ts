// 共通の型定義をまとめたファイル

// ユーザー情報の型定義
export type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
}

// タグの型定義（バックエンドのEsaTagCamelCaseと同じ構造）
export type Tag = {
  name: string;
  postsCount: number;
}

// 日報表示タイプのenum
export enum DailyReportType {
  HTML = 'HTML',
  TEXT = 'TEXT',
  SHARE = 'SHARE',
}

// Form要素のイベントハンドラー型
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type TextAreaChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
