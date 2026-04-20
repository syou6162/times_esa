/**
 * esa.io API を叩くための薄い HTTP クライアント。
 * axios の代替として Node.js 標準 fetch をラップする。
 *
 * 利用側が axios 時代と同じ書き味で使えるよう、.get / .post / .patch の
 * 3 メソッドだけを提供する（axios の超サブセット）。
 */

import { type EsaErrorResponse } from './types';

export interface EsaHttpClient {
  get<T>(path: string, options?: { params?: Record<string, string | number> }): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
}

/**
 * axios の AxiosError.response.data と同じ形状を持つエラー。
 * 既存の catch 節 (`err.response?.data.error` / `err.response?.data.message`) が
 * そのまま動くように互換形状で投げる。
 */
export class EsaHttpError extends Error {
  readonly response: { data: EsaErrorResponse; status: number };
  constructor(status: number, data: EsaErrorResponse) {
    super(`${data.error}: ${data.message}`);
    this.name = 'EsaHttpError';
    this.response = { data, status };
  }
}

const BASE_URL = 'https://api.esa.io';

export function createEsaClient(accessToken: string): EsaHttpClient {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  // esa.io API へ共通処理で fetch を呼ぶ内部ヘルパー。
  // get / post / patch の共通実装をここに寄せる。
  async function esaFetch<T>(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    options?: { params?: Record<string, string | number>; body?: unknown }
  ): Promise<T> {
    const url = new URL(path, BASE_URL);
    if (options?.params) {
      for (const [k, v] of Object.entries(options.params)) {
        url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      // esa.io はエラー時に { error, message } の JSON を返す想定。
      // body が JSON で無い場合も落ちないよう catch で空オブジェクトを返す。
      const data = (await res.json().catch(() => ({}))) as EsaErrorResponse;
      throw new EsaHttpError(res.status, data);
    }

    return (await res.json()) as T;
  }

  return {
    get: <T>(path: string, options?: { params?: Record<string, string | number> }) =>
      esaFetch<T>('GET', path, options),
    post: <T>(path: string, body: unknown) =>
      esaFetch<T>('POST', path, { body }),
    patch: <T>(path: string, body: unknown) =>
      esaFetch<T>('PATCH', path, { body }),
  };
}
