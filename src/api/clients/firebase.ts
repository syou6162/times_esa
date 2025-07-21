import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functionsRegion } from '../../util';
import type {
  ApiClient,
  DailyReportRequest,
  DailyReportResponse,
  TagListRequest,
  TagListResponse,
  SubmitTextToEsaRequest,
  SubmitTextToEsaResponse,
  RecentDailyReportsRequest,
  RecentDailyReportsResponse,
} from '../types';

// Firebase Functions呼び出しヘルパー
const callFirebaseFunction = <TRequest, TResponse>(
  functionName: string,
  data?: TRequest,
  options?: { timeout?: number }
): Promise<HttpsCallableResult<TResponse>> => {
  if (!import.meta.env.VITE_API_KEY) {
    throw new Error('Firebase configuration is missing. Please set up Firebase credentials.');
  }

  const functions = getFunctions();
  functions.region = functionsRegion;

  const callable = httpsCallable<TRequest, TResponse>(
    functions,
    functionName,
    options
  );

  return callable(data as TRequest);
};

// Firebase APIクライアントの実装
export class FirebaseApiClient implements ApiClient {
  getDailyReport(category: string): Promise<HttpsCallableResult<DailyReportResponse>> {
    return callFirebaseFunction<DailyReportRequest, DailyReportResponse>(
      'dailyReport',
      { category }
    );
  }

  getTagList(): Promise<HttpsCallableResult<TagListResponse>> {
    return callFirebaseFunction<TagListRequest, TagListResponse>('tagList');
  }

  submitTextToEsa(
    category: string,
    tags: string[],
    title: string,
    text: string
  ): Promise<HttpsCallableResult<SubmitTextToEsaResponse>> {
    return callFirebaseFunction<SubmitTextToEsaRequest, SubmitTextToEsaResponse>(
      'submitTextToEsa',
      { category, tags, title, text },
      { timeout: 10000 }
    );
  }

  getRecentDailyReports(): Promise<HttpsCallableResult<RecentDailyReportsResponse>> {
    return callFirebaseFunction<RecentDailyReportsRequest, RecentDailyReportsResponse>(
      'recentDailyReports',
      {}
    );
  }
}
