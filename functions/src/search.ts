/**
 * ESA APIを使用した汎用的な投稿検索機能
 */

import { AxiosInstance } from 'axios';
import { SearchOption, combineOptions } from './searchOptions';
import { createAxiosClient, getEsaConfig, type EsaSearchResult, type EsaPost } from './index';

/**
 * 検索パラメータの型定義
 */
export interface SearchParams {
  options: SearchOption[];
  page?: number;
  perPage?: number;
  sort?: 'created' | 'updated' | 'number' | 'stars' | 'comments' | 'best_match';
  order?: 'asc' | 'desc';
}

/**
 * 汎用的な投稿検索関数
 * @param params - 検索パラメータ
 * @param axiosClient - Axiosクライアント（テスト用にオプション）
 * @returns 検索結果
 */
export async function searchPosts(
  params: SearchParams,
  axiosClient?: AxiosInstance
): Promise<EsaSearchResult> {
  const client = axiosClient || createAxiosClient();
  const config = getEsaConfig();
  
  // 検索クエリを構築
  const query = combineOptions(params.options);
  
  // APIパラメータを構築
  const apiParams = {
    q: query,
    page: params.page || 1,
    per_page: params.perPage || 20,
    sort: params.sort || 'best_match',
    order: params.order || 'desc'
  };
  
  try {
    const response = await client.get<EsaSearchResult>(
      `/teams/${config.teamName}/posts`,
      { params: apiParams }
    );
    
    return response.data;
  } catch (error) {
    // エラーハンドリング（既存のコードと同様）
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during search');
  }
}

/**
 * 日報を検索する関数（特定のカテゴリとタイトルで検索）
 * @param date - 日付（YYYY-MM-DD形式）
 * @param axiosClient - Axiosクライアント（テスト用にオプション）
 * @returns 検索結果
 */
export async function searchDailyReport(
  date: string,
  axiosClient?: AxiosInstance
): Promise<EsaSearchResult> {
  // 日付からカテゴリとタイトルを構築
  const [year, month, day] = date.split('-');
  const category = `日報/${year}/${month}`;
  const titleDate = `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
  
  // 検索オプションを構築
  const options: SearchOption[] = [
    { query: `in:${category}` },
    { query: `title:${titleDate}` }
  ];
  
  return searchPosts({
    options,
    perPage: 10
  }, axiosClient);
}