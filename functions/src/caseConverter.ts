/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 * esa APIのレスポンス構造に特化
 */

import { type DateString, type DailyReportCategory } from './dateUtils';

// esa APIからのレスポンス型定義（スネークケース）
export type EsaPost = {
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];  // タグ名の文字列配列（変換不要）
  updated_at: string;
  url: string;
  category: string;
}

export type Tag = {
  name: string;  // タグ名（変換不要）
  posts_count: number;
}

export type EsaTags = {
  tags: Tag[];
  total_count: number;
}

export type EsaSearchResult = {
  posts: EsaPost[];
  total_count: number;
}

// 変換後の型定義（キャメルケース、フロントエンドで使用）
export type EsaPostCamelCase = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];  // タグ名はそのまま保持
  updatedAt: string;
  url: string;
  category: string;
}

export type EsaTagCamelCase = {
  name: string;  // タグ名はそのまま保持
  postsCount: number;
}

export type EsaTagsCamelCase = {
  tags: EsaTagCamelCase[];
  totalCount: number;
}

/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 * タグ名などの値は変換せず、フィールド名のみを変換
 */
export function convertEsaPostToCamelCase(esaPost: EsaPost): EsaPostCamelCase {
  return {
    bodyMd: esaPost.body_md,
    bodyHtml: esaPost.body_html,
    number: esaPost.number,
    name: esaPost.name,
    tags: esaPost.tags,  // タグ名の配列はそのまま
    updatedAt: esaPost.updated_at,
    url: esaPost.url,
    category: esaPost.category
  };
}

/**
 * EsaのAPIレスポンス（タグリスト）をキャメルケースに変換
 * タグ名は変換せず、フィールド名のみを変換
 */
export function convertEsaTagsToCamelCase(esaTags: EsaTags): EsaTagsCamelCase {
  return {
    tags: esaTags.tags.map(tag => ({
      name: tag.name,  // タグ名はそのまま
      postsCount: tag.posts_count
    })),
    totalCount: esaTags.total_count
  };
}

// 日報サマリー関連の型定義（スネークケース）
export type DailyReportSummary = {
  date: DateString;
  title: string;
  category: DailyReportCategory;
  updated_at: string;
  number: number;
}

export type RecentDailyReportsResponse = {
  reports: DailyReportSummary[];
  total_count: number;
}

// 日報サマリー関連の型定義（キャメルケース）
export type DailyReportSummaryCamelCase = {
  date: DateString;
  title: string;
  category: DailyReportCategory;
  updatedAt: string;
  number: number;
}

export type RecentDailyReportsResponseCamelCase = {
  reports: DailyReportSummaryCamelCase[];
  totalCount: number;
}

/**
 * 日報サマリーをキャメルケースに変換
 */
export function convertDailyReportSummaryToCamelCase(summary: DailyReportSummary): DailyReportSummaryCamelCase {
  return {
    date: summary.date,
    title: summary.title,
    category: summary.category,
    updatedAt: summary.updated_at,
    number: summary.number
  };
}

/**
 * 最近の日報リストレスポンスをキャメルケースに変換
 */
export function convertRecentDailyReportsResponseToCamelCase(response: RecentDailyReportsResponse): RecentDailyReportsResponseCamelCase {
  return {
    reports: response.reports.map(report => convertDailyReportSummaryToCamelCase(report)),
    totalCount: response.total_count
  };
}