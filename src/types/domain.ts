/**
 * ドメインモデルの型定義
 * 
 * アプリケーション内で使用するドメインモデルの型を定義
 * 基本的にcamelCaseを使用
 */

// タグ情報
export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
};

// 日報サマリー（一覧表示用）
export type DailyReportSummary = {
  date: string; // yyyy-MM-dd形式
  title: string;
  postsCount: number;
  tags: string[];
  formattedDate: string; // 日本語日付（例: "6月19日(水)"）
  url?: string; // esaのURL
};

// 日報コンテンツ（API responseの形式）
export type DailyReportContent = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
};

// 日報データ（アプリ内部で使用する形式、camelCase）
export type DailyReportData = {
  updatedAt: string;
  url: string;
  text: string;      // body_md → text
  html: string;      // body_html → html
  tags: string[];
  title: string;     // name → title
  category: string;
};

// ユーザー情報
export type GoogleUser = {
  email: string;
  displayName: string;
  photoURL: string;
};

// 日報の表示モード
export type ReportViewMode = 'today' | 'past';

// 日報選択の状態
export type SelectedDateState = 'today' | string; // 'today' または yyyy-MM-dd形式