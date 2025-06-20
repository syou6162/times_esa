/**
 * 過去の日報リストを取得するための機能
 */

import { AxiosInstance } from 'axios';
import { withCategory, combineOptions } from './searchOptions';
import { searchPosts } from './search';
import { getDateRangeCategories, formatCategoryToDate, type DailyReportCategory, type DateString } from './dateUtils';
import { type DailyReportSummary, type EsaPost } from './index';

/**
 * 複数の日報カテゴリをOR検索クエリとして結合する
 * @param categories - 日報カテゴリの配列
 * @returns OR検索用のクエリ文字列
 */
export function createMultipleCategoryQuery(categories: DailyReportCategory[]): string {
  if (categories.length === 0) {
    return '';
  }
  
  // 各カテゴリを on: で完全一致検索し、OR で結合
  const queries = categories.map(category => `on:${category}`);
  return queries.join(' OR ');
}

/**
 * ESA投稿から日報サマリー情報を抽出する
 * @param post - ESA投稿
 * @returns 日報サマリー
 */
export function extractDailyReportSummary(post: EsaPost & { category: DailyReportCategory; updated_at: string }): DailyReportSummary {
  return {
    date: formatCategoryToDate(post.category),
    title: post.name,
    category: post.category,
    updated_at: post.updated_at,
    number: post.number
  };
}

/**
 * 過去の日報リストを取得する
 * @param days - 取得する日数（デフォルト: 10）
 * @param axiosClient - Axiosクライアント（テスト用にオプション）
 * @returns 日報リストと総数
 */
export async function getRecentReports(
  days: number = 10,
  axiosClient?: AxiosInstance
): Promise<{ reports: DailyReportSummary[]; total_count: number }> {
  // 過去N日分のカテゴリを生成
  const categories = getDateRangeCategories(days);
  
  // OR検索クエリを構築
  const query = createMultipleCategoryQuery(categories);
  
  // 検索実行
  const result = await searchPosts({
    options: [{ query }],
    perPage: days, // 最大でも指定日数分しか存在しないはず
    sort: 'updated',
    order: 'desc'
  }, axiosClient);
  
  // 結果を日報サマリー形式に変換
  const reports = result.posts
    .filter(post => {
      // 念のため日報カテゴリのみをフィルタリング
      const categoryMatch = (post as any).category?.match(/^日報\/\d{4}\/\d{2}\/\d{2}$/);
      return categoryMatch !== null;
    })
    .map(post => extractDailyReportSummary(post as EsaPost & { category: DailyReportCategory; updated_at: string }));
  
  return {
    reports,
    total_count: result.total_count
  };
}