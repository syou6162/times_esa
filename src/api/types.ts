import type { HttpsCallableResult } from 'firebase/functions';
import type {
  DailyReportResponse,
  TagListResponse,
  SubmitTextToEsaResponse,
  RecentDailyReportsResponse
} from '../../types/api';

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
