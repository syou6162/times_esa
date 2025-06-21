// API レスポンスの共通型定義
// バックエンドとフロントエンドで共有される型

// Esa APIレスポンスの基本型（キャメルケース）
export type EsaPost = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];
  updatedAt: string;
  url: string;
  category: string;
}

export type EsaTag = {
  name: string;
  postsCount: number;
}

export type EsaTags = {
  tags: EsaTag[];
  totalCount: number;
}

// 日報サマリー関連の型定義
export type DailyReportSummary = {
  date: string;  // yyyy-MM-dd形式
  title: string;
  category: string;
  updatedAt: string;
  number: number;
}

export type RecentDailyReportsResponse = {
  reports: DailyReportSummary[];
  totalCount: number;
}

// APIリクエスト/レスポンスの型定義
export type DailyReportRequest = {
  category: string;
}

export type DailyReportResponse = EsaPost;

export type TagListRequest = {}

export type TagListResponse = EsaTags;

export type SubmitTextToEsaRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type SubmitTextToEsaResponse = EsaPost;

export type RecentDailyReportsRequest = {
  days?: number;
}