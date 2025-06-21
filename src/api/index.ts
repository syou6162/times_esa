import { 
  mockDailyReportData, 
  mockDailyReportNotFoundError,
  mockTagListData,
  mockRecentDailyReportsData,
  createSubmitResponse 
} from './mockData';
import { firebaseApi } from './firebase';
import type { HttpsCallableResult } from 'firebase/functions';
import { config } from '../config';

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

// API関数
export const getDailyReport = async (category: string) => {
  if (config.useMockApi) {
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
  
  return firebaseApi.getDailyReport(category);
};

export const getTagList = async () => {
  if (config.useMockApi) {
    return createMockResponse(mockTagListData);
  }
  
  return firebaseApi.getTagList();
};

export const submitTextToEsa = async (
  category: string,
  tags: string[],
  title: string,
  text: string
) => {
  if (config.useMockApi) {
    // モックモード: 入力されたデータを既存の日報に追記したような形で返す
    const response = createSubmitResponse(category, tags, title, text);
    return createMockResponse(response);
  }
  
  return firebaseApi.submitTextToEsa(category, tags, title, text);
};

export const getRecentDailyReports = async () => {
  if (config.useMockApi) {
    return createMockResponse(mockRecentDailyReportsData);
  }
  
  return firebaseApi.getRecentDailyReports();
};

// 型のエクスポート（コンポーネントで使用）
export type { 
  DailyReportResponse,
  TagListResponse,
  SubmitTextToEsaResponse,
  RecentDailyReportsResponse
} from './firebase';