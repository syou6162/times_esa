/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 * esa APIのレスポンス構造に特化
 */

import { type DateString, type DailyReportCategory } from '../../types/domain';
// 変換後の型定義をインポート
import type {
  EsaPost,
  EsaTags,
  DailyReportSummary,
  RecentDailyReportsResponse
} from '../../types/api';

// esa APIからのレスポンス型定義（スネークケース）
export type EsaPostSnakeCase = {
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];  // タグ名の文字列配列（変換不要）
  updated_at: string;
  url: string;
  category: string;
}

export type TagSnakeCase = {
  name: string;  // タグ名（変換不要）
  posts_count: number;
}

export type EsaTagsSnakeCase = {
  tags: TagSnakeCase[];
  total_count: number;
}

export type EsaSearchResult = {
  posts: EsaPostSnakeCase[];
  total_count: number;
}


/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 * タグ名などの値は変換せず、フィールド名のみを変換
 */
export function convertEsaPostToCamelCase(esaPost: EsaPostSnakeCase): EsaPost {
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
export function convertEsaTagsToCamelCase(esaTags: EsaTagsSnakeCase): EsaTags {
  return {
    tags: esaTags.tags.map(tag => ({
      name: tag.name,  // タグ名はそのまま
      postsCount: tag.posts_count
    })),
    totalCount: esaTags.total_count
  };
}

// 日報サマリー関連の型定義（スネークケース）
export type DailyReportSummarySnakeCase = {
  date: DateString;
  title: string;
  tags: string[];
  category: DailyReportCategory;
  updated_at: string;
  number: number;
}

export type RecentDailyReportsResponseSnakeCase = {
  reports: DailyReportSummarySnakeCase[];
  total_count: number;
}


/**
 * 日報サマリーをキャメルケースに変換
 */
export function convertDailyReportSummaryToCamelCase(summary: DailyReportSummarySnakeCase): DailyReportSummary {
  return {
    date: summary.date,
    title: summary.title,
    tags: summary.tags,
    category: summary.category,
    updatedAt: summary.updated_at,
    number: summary.number
  };
}

/**
 * 最近の日報リストレスポンスをキャメルケースに変換
 */
export function convertRecentDailyReportsResponseToCamelCase(response: RecentDailyReportsResponseSnakeCase): RecentDailyReportsResponse {
  return {
    reports: response.reports.map(report => convertDailyReportSummaryToCamelCase(report)),
    totalCount: response.total_count
  };
}
