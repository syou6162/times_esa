import type { HttpsCallableResult } from 'firebase/functions';

// リクエスト/レスポンスの型定義
export type DailyReportRequest = {
  category: string;
}

export type DailyReportResponse = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

export type TagListRequest = {}

export type TagListResponse = {
  tags: Array<{
    name: string;
    posts_count: number;
  }>;
}

export type SubmitTextToEsaRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type SubmitTextToEsaResponse = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

export type RecentDailyReportsRequest = {}

export type RecentDailyReportsResponse = {
  reports: Array<{
    date: string;
    url: string;
    posts_count: number;
  }>;
}

// APIクライアントのインターフェース
export interface ApiClient {
  getDailyReport(category: string): Promise<HttpsCallableResult<DailyReportResponse>>;
  getTagList(): Promise<HttpsCallableResult<TagListResponse>>;
  submitTextToEsa(
    category: string,
    tags: string[],
    title: string,
    text: string
  ): Promise<HttpsCallableResult<SubmitTextToEsaResponse>>;
  getRecentDailyReports(): Promise<HttpsCallableResult<RecentDailyReportsResponse>>;
}