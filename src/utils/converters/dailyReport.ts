/**
 * 日報データの変換関数
 * 
 * ESA APIのレスポンス（snake_case）をアプリ内部のモデル（camelCase）に変換
 */

import { 
  DailyReportResponseType, 
  TagListResponseType,
  RecentDailyReportsResponse 
} from '../../types/api';
import { 
  DailyReportData, 
  Tag,
  DailyReportSummary 
} from '../../types/domain';

/**
 * 日報レスポンスをアプリ内部のデータ形式に変換
 */
export const convertDailyReportResponse = (response: DailyReportResponseType): DailyReportData => {
  return {
    updatedAt: response.updated_at,
    url: response.url,
    text: response.body_md,
    html: response.body_html,
    tags: response.tags,
    title: response.name,
    category: response.category,
  };
};

/**
 * タグレスポンスをアプリ内部のデータ形式に変換
 * 
 * 現状はそのまま返すだけだが、将来的な変更に備えて変換関数を用意
 */
export const convertTagListResponse = (response: TagListResponseType): Tag[] => {
  return response.tags;
};

/**
 * 最近の日報一覧レスポンスをアプリ内部のデータ形式に変換
 */
export const convertRecentReportsResponse = (response: RecentDailyReportsResponse): DailyReportSummary[] => {
  return response.reports.map(report => ({
    date: report.date,
    title: report.title,
    postsCount: report.posts_count,  // snake_case → camelCase
    tags: report.tags,
    formattedDate: report.formatted_date,  // snake_case → camelCase
    url: report.url,
  }));
};