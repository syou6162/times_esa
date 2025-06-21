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
    // モックモード: 今日の日報でない場合はNOT_FOUNDエラー
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    if (!category.includes(today)) {
      return createMockError(
        mockDailyReportNotFoundError.code,
        mockDailyReportNotFoundError.message
      );
    }
    return createMockResponse(mockDailyReportData);
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