/**
 * Firebase Functionsのリクエスト/レスポンス型定義
 */

import { type DailyReportCategory } from './dateUtils';

// 設定型定義
export type EsaConfig = {
  teamName: string;
  accessToken: string;
}

// リクエスト型定義
export type SubmitTextRequest = {
  category: DailyReportCategory;
  tags: string[];
  title: string;
  text: string;
}

export type DailyReportRequest = {
  category: DailyReportCategory;
}

export type RecentDailyReportsRequest = {
  days?: number; // 過去何日分を取得するか（デフォルト: 10）
}

// エラーレスポンス型定義
export type EsaErrorResponse = {
  error: string;
  message: string;
}