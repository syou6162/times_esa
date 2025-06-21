// 共通の型定義をまとめたファイル

// ユーザー情報の型定義
export type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
}

// タグの型定義
export type Tag = {
  name: string;
  posts_count: number;
}

// 日報表示タイプのenum
export enum DailyReportType {
  HTML = 'HTML',
  TEXT = 'TEXT',
  SHARE = 'SHARE',
}