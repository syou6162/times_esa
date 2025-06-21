// API レスポンスの共通型定義
// バックエンドとフロントエンドで共有される型

// Esa APIレスポンスの基本型（キャメルケース）
export type EsaPostResponse = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];
  updatedAt: string;
  url: string;
  category: string;
}

export type EsaTagResponse = {
  name: string;
  postsCount: number;
}

export type EsaTagsResponse = {
  tags: EsaTagResponse[];
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

export type DailyReportResponse = EsaPostResponse;

export type TagListRequest = {}

export type TagListResponse = EsaTagsResponse;

export type SubmitTextToEsaRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type SubmitTextToEsaResponse = EsaPostResponse;

export type RecentDailyReportsRequest = {
  days?: number;
}