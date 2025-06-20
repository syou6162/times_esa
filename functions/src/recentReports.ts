/**
 * 過去の日報リストを取得する機能
 */

import { AxiosInstance } from 'axios';
import { searchPosts } from './search';
import { withCategory, withDateRange, combineOptions } from './searchOptions';
import type { EsaPost, EsaSearchResult } from './index';

/**
 * 最近の日報リストのパラメータ
 */
export type RecentReportsParams = {
  days?: number; // 過去何日分を取得するか（デフォルト: 7）
  page?: number; // ページ番号
  perPage?: number; // 1ページあたりの件数
}

/**
 * 最近の日報リストレスポンス
 */
export type RecentReportsResponse = {
  reports: DailyReportSummary[];
  totalCount: number;
  page: number;
  perPage: number;
}

/**
 * 日報サマリー情報
 */
export type DailyReportSummary = {
  date: string; // YYYY-MM-DD形式
  title: string;
  number: number;
  tags: string[];
}

/**
 * 過去の日報リストを取得
 * @param params - 検索パラメータ
 * @param axiosClient - Axiosクライアント
 * @returns 日報リスト
 */
export async function getRecentReports(
  params: RecentReportsParams,
  axiosClient: AxiosInstance
): Promise<RecentReportsResponse> {
  const days = params.days || 7;
  const page = params.page || 1;
  const perPage = params.perPage || 20;
  
  // 日付範囲を計算
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // YYYY-MM-DD形式にフォーマット
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 検索オプションを構築
  const searchOptions = [
    withCategory('日報'),
    withDateRange(formatDate(startDate), formatDate(endDate))
  ];
  
  // 検索実行
  const result = await searchPosts({
    options: searchOptions,
    page,
    perPage,
    sort: 'created',
    order: 'desc'
  }, axiosClient);
  
  // レスポンスを整形
  const reports: DailyReportSummary[] = result.posts.map(post => {
    // タイトルから日付を抽出（例: "6月20日 (金)" -> "06-20"）
    const dateMatch = post.name.match(/(\d{1,2})月(\d{1,2})日/);
    let date = '';
    
    if (dateMatch) {
      // カテゴリから年を取得する必要がある
      // esaのレスポンスにはカテゴリ情報が含まれていないため、
      // 現在の年を使用（改善の余地あり）
      const year = new Date().getFullYear();
      const month = dateMatch[1].padStart(2, '0');
      const day = dateMatch[2].padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
    
    return {
      date,
      title: post.name,
      number: post.number,
      tags: post.tags
    };
  });
  
  return {
    reports,
    totalCount: result.total_count,
    page,
    perPage
  };
}