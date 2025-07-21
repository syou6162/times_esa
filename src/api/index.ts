import { apiClient } from './client';

// API関数をエクスポート（使用側は変更不要）
export const getDailyReport = (category: string) => {
  return apiClient.getDailyReport(category);
};

export const getTagList = () => {
  return apiClient.getTagList();
};

export const submitTextToEsa = (
  category: string,
  tags: string[],
  title: string,
  text: string
) => {
  return apiClient.submitTextToEsa(category, tags, title, text);
};

export const getRecentDailyReports = () => {
  return apiClient.getRecentDailyReports();
};

// 型のエクスポート（コンポーネントで使用）
export type {
  DailyReportResponse,
  TagListResponse,
  SubmitTextToEsaResponse,
  RecentDailyReportsResponse,
} from './types';
