/**
 * ESA APIを使用した汎用的な投稿検索機能
 */

import { AxiosInstance } from 'axios';
import { SearchOption, combineOptions } from './searchOptions';
import { createAxiosClient, getEsaConfig, type EsaSearchResult } from './index';

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
  
  // APIパラメータを構築（esa.ioのデフォルト値に合わせる）
  const apiParams = {
    q: query,
    page: params.page || 1,
    per_page: params.perPage || 20,
    sort: params.sort || 'updated',
    order: params.order || 'desc'
  };
  
  const response = await client.get<EsaSearchResult>(
    `/v1/teams/${config.teamName}/posts`,
    { params: apiParams }
  );
  
  return response.data;
}

/**
 * 日報を検索する関数（特定の日付のカテゴリで検索）
 * @param date - 日付（YYYY-MM-DD形式）
 * @param axiosClient - Axiosクライアント（テスト用にオプション）
 * @returns 検索結果
 */
export async function searchDailyReport(
  date: string,
  axiosClient?: AxiosInstance
): Promise<EsaSearchResult> {
  const client = axiosClient || createAxiosClient();
  const config = getEsaConfig();
  
  // 日付からカテゴリを構築（日報は日付まで含むカテゴリ構造）
  const [year, month, day] = date.split('-');
  const category = `日報/${year}/${month}/${day}`;
  
  // 完全一致検索で特定の日付の日報を取得
  const response = await client.get<EsaSearchResult>(
    `/v1/teams/${config.teamName}/posts`,
    { 
      params: {
        q: `on:${category}`
      }
    }
  );
  
  return response.data;
}