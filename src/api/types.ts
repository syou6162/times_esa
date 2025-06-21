import type { HttpsCallableResult } from 'firebase/functions';

// 共通の型定義
export type EsaPostResponse = {
  updatedAt: string;
  url: string;
  bodyMd: string;
  bodyHtml: string;
  tags: string[];
  name: string;
  category: string;
  number: number;
}

// リクエスト/レスポンスの型定義
export type DailyReportRequest = {
  category: string;
}

export type DailyReportResponse = EsaPostResponse;

export type TagListRequest = {}

export type TagListResponse = {
  tags: Array<{
    name: string;
    postsCount: number;
  }>;
  totalCount: number;
}

export type SubmitTextToEsaRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type SubmitTextToEsaResponse = EsaPostResponse;

export type RecentDailyReportsRequest = {}

export type RecentDailyReportsResponse = {
  reports: Array<{
    date: string;
    title: string;
    category: string;
    updatedAt: string;
    number: number;
  }>;
  totalCount: number;
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