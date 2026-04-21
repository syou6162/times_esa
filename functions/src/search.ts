/**
 * ESA APIを使用した汎用的な投稿検索機能
 */

import { type EsaHttpClient } from './esaHttpClient';
import { SearchOption, combineOptions } from './searchOptions';
import { getEsaConfig } from './index';
import { type EsaSearchResult } from './caseConverter';

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
 * @param client - esa.io 用 HTTP クライアント
 * @param params - 検索パラメータ
 * @returns 検索結果
 */
export async function searchPosts(
  client: EsaHttpClient,
  params: SearchParams
): Promise<EsaSearchResult> {
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

  return await client.get<EsaSearchResult>(
    `/v1/teams/${config.teamName}/posts`,
    { params: apiParams }
  );
}

/**
 * 日報を検索する関数（特定の日付のカテゴリで検索）
 * @param client - esa.io 用 HTTP クライアント
 * @param date - 日付（YYYY-MM-DD形式）
 * @returns 検索結果
 */
export async function searchDailyReport(
  client: EsaHttpClient,
  date: string
): Promise<EsaSearchResult> {
  const config = getEsaConfig();

  // 日付からカテゴリを構築（日報は日付まで含むカテゴリ構造）
  const [year, month, day] = date.split('-');
  const category = `日報/${year}/${month}/${day}`;

  // 完全一致検索で特定の日付の日報を取得
  return await client.get<EsaSearchResult>(
    `/v1/teams/${config.teamName}/posts`,
    {
      params: {
        q: `on:${category}`
      }
    }
  );
}
