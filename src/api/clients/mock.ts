import type { HttpsCallableResult } from 'firebase/functions';
import type {
  ApiClient,
  DailyReportResponse,
  TagListResponse,
  SubmitTextToEsaResponse,
  RecentDailyReportsResponse,
} from '../types';
import {
  mockDailyReportData,
  mockDailyReportNotFoundError,
  mockTagListData,
  mockRecentDailyReportsData,
  createSubmitResponse,
} from '../mockData';

// モックレスポンスをFirebase Functionsのレスポンス形式に変換
const createMockResponse = <T>(data: T): Promise<HttpsCallableResult<T>> => {
  return Promise.resolve({
    data,
  });
};

// モックエラーをFirebase Functionsのエラー形式に変換
const createMockError = (code: string, message: string): Promise<never> => {
  const error = new Error(message);
  (error as any).code = code;
  return Promise.reject(error);
};

// モックAPIクライアントの実装
export class MockApiClient implements ApiClient {
  async getDailyReport(category: string): Promise<HttpsCallableResult<DailyReportResponse>> {
    // カテゴリから日付を抽出（例: "日報/2025/06/20" → "2025-06-20"）
    const dateMatch = category.match(/日報\/(\d{4})\/(\d{2})\/(\d{2})/);
    if (!dateMatch) {
      return createMockError(
        mockDailyReportNotFoundError.code,
        mockDailyReportNotFoundError.message
      );
    }

    const dateString = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;

    // モックレポートを返す（日付に応じて内容を少し変える）
    const mockReport = {
      ...mockDailyReportData,
      category,
      bodyMd: mockDailyReportData.bodyMd.replace(/今日/g, dateString),
      bodyHtml: mockDailyReportData.bodyHtml.replace(/今日/g, dateString),
    };

    return createMockResponse(mockReport);
  }

  async getTagList(): Promise<HttpsCallableResult<TagListResponse>> {
    return createMockResponse(mockTagListData);
  }

  async submitTextToEsa(
    category: string,
    tags: string[],
    title: string,
    text: string
  ): Promise<HttpsCallableResult<SubmitTextToEsaResponse>> {
    // モックモード: 入力されたデータを既存の日報に追記したような形で返す
    const response = createSubmitResponse(category, tags, title, text);
    return createMockResponse(response);
  }

  async getRecentDailyReports(): Promise<HttpsCallableResult<RecentDailyReportsResponse>> {
    return createMockResponse(mockRecentDailyReportsData);
  }
}
