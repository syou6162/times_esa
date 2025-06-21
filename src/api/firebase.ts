import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functionsRegion } from '../util';

// 型定義
export type DailyReportRequest = {
  category: string;
}

export type DailyReportResponse = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

export type TagListRequest = {}

export type TagListResponse = {
  tags: Array<{
    name: string;
    posts_count: number;
  }>;
}

export type SubmitTextToEsaRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type SubmitTextToEsaResponse = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

export type RecentDailyReportsRequest = {}

export type RecentDailyReportsResponse = {
  reports: Array<{
    date: string;
    url: string;
    posts_count: number;
  }>;
}

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

// Firebase Functions API
export const firebaseApi = {
  getDailyReport: (category: string) => 
    callFirebaseFunction<DailyReportRequest, DailyReportResponse>(
      'dailyReport',
      { category }
    ),
  
  getTagList: () => 
    callFirebaseFunction<TagListRequest, TagListResponse>('tagList'),
  
  submitTextToEsa: (category: string, tags: string[], title: string, text: string) =>
    callFirebaseFunction<SubmitTextToEsaRequest, SubmitTextToEsaResponse>(
      'submitTextToEsa',
      { category, tags, title, text },
      { timeout: 10000 }
    ),
  
  getRecentDailyReports: () =>
    callFirebaseFunction<RecentDailyReportsRequest, RecentDailyReportsResponse>(
      'recentDailyReports'
    ),
};