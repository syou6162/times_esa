/**
 * 日報関連の型定義
 */

export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
};

export type DailyReportSummary = {
  date: string; // yyyy-MM-dd形式
  title: string;
  postsCount: number;
  tags: string[];
  formattedDate: string; // 日本語日付（例: "6月19日(水)"）
  url?: string; // esaのURL
};

export type DailyReportContent = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
};

export type DailyReportRequestType = {
  category: string;
};

export type DailyReportResponseType = DailyReportContent;

export type TagListRequestType = Record<string, never>;

export type TagListResponseType = {
  tags: Tag[];
};

export type RecentDailyReportsRequest = {
  days?: number; // 過去何日分を取得するか（デフォルト: 10）
};

export type RecentDailyReportsResponse = {
  reports: DailyReportSummary[];
  total_count: number;
};

/**
 * 日報の表示モード
 */
export type ReportViewMode = 'today' | 'past';

/**
 * 日報選択の状態
 */
export type SelectedDateState = 'today' | string; // 'today' または yyyy-MM-dd形式