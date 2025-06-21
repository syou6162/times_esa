/**
 * API関連の型定義
 * 
 * APIのリクエスト・レスポンスに関する型を定義
 * 基本的にAPIの仕様に合わせてsnake_caseを使用
 */

// 日報取得API
export type DailyReportRequestType = {
  category: string;
};

export type DailyReportResponseType = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
};

// タグ一覧取得API
export type TagListRequestType = Record<string, never>;

export type TagListResponseType = {
  tags: Array<{
    name: string;
    posts_count: number;
  }>;
};

// 最近の日報一覧取得API
export type RecentDailyReportsRequest = {
  days?: number; // 過去何日分を取得するか（デフォルト: 10）
};

export type RecentDailyReportsResponse = {
  reports: Array<{
    date: string;
    title: string;
    posts_count: number;
    tags: string[];
    formatted_date: string;
    url?: string;
  }>;
  total_count: number;
};

// ESA投稿API
export type SubmitTextToEsaRequestType = {
  category: string;
  tags: string[];
  title: string;
  text: string;
};

export type SubmitTextToEsaResponseType = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
};