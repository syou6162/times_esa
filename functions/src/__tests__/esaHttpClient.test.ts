import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEsaClient, EsaHttpError } from '../esaHttpClient';

const mockFetch = vi.fn();

/**
 * fetch に渡された [url, init] を型付きで取り出す。
 * vitest の `MockInstance.mock.calls` は `any[][]` として型付けされているため、
 * eslint の `no-unsafe-*` ルールに引っかからないようテスト側で境界のキャストを閉じる。
 */
function getFetchCallArgs(callIndex = 0): [URL, RequestInit] {
  return mockFetch.mock.calls[callIndex] as unknown as [URL, RequestInit];
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EsaHttpClient', () => {
  describe('get', () => {
    it('params を URL クエリとしてエンコードする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_count: 0, posts: [] }),
      });

      const client = createEsaClient('test-token');
      const result = await client.get<{ total_count: number; posts: unknown[] }>(
        '/v1/teams/foo/posts',
        { params: { q: 'on:日報/2026/04/20', per_page: 20 } },
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = getFetchCallArgs();
      expect(calledUrl).toBeInstanceOf(URL);
      expect(calledUrl.href).toBe(
        'https://api.esa.io/v1/teams/foo/posts?q=on%3A%E6%97%A5%E5%A0%B1%2F2026%2F04%2F20&per_page=20',
      );
      expect(calledInit).toMatchObject({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }) as unknown,
      });
      expect(calledInit.body).toBeUndefined();
      expect(result).toEqual({ total_count: 0, posts: [] });
    });

    it('params 無しでも動く', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tags: [], total_count: 0 }),
      });

      const client = createEsaClient('test-token');
      const result = await client.get<{ tags: unknown[]; total_count: number }>(
        '/v1/teams/foo/tags',
      );

      const [calledUrl, calledInit] = getFetchCallArgs();
      expect(calledUrl.href).toBe('https://api.esa.io/v1/teams/foo/tags');
      expect(calledInit).toMatchObject({ method: 'GET' });
      expect(result).toEqual({ tags: [], total_count: 0 });
    });

    it('成功レスポンスが .data でラップされずそのまま返る', async () => {
      const payload = {
        total_count: 1,
        posts: [{ number: 42, name: 'test', body_md: '', body_html: '', tags: [] }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(payload),
      });

      const client = createEsaClient('test-token');
      const result = await client.get<typeof payload>('/v1/teams/foo/posts');

      expect(result).toEqual(payload);
      expect(result).not.toHaveProperty('data');
    });
  });

  describe('post', () => {
    it('body が JSON 文字列化されて送られる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ number: 1 }),
      });

      const client = createEsaClient('test-token');
      await client.post<{ number: number }>('/v1/teams/foo/posts', {
        post: { name: 'x' },
      });

      const [calledUrl, calledInit] = getFetchCallArgs();
      expect(calledUrl.href).toBe('https://api.esa.io/v1/teams/foo/posts');
      expect(calledInit).toMatchObject({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }) as unknown,
      });
      expect(calledInit.body).toBe('{"post":{"name":"x"}}');
    });
  });

  describe('patch', () => {
    it('method が PATCH で body が JSON 化される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ number: 42 }),
      });

      const client = createEsaClient('test-token');
      await client.patch<{ number: number }>('/v1/teams/foo/posts/42', {
        post: { body_md: 'updated' },
      });

      const [calledUrl, calledInit] = getFetchCallArgs();
      expect(calledUrl.href).toBe('https://api.esa.io/v1/teams/foo/posts/42');
      expect(calledInit).toMatchObject({ method: 'PATCH' });
      expect(calledInit.body).toBe('{"post":{"body_md":"updated"}}');
    });
  });

  describe('error handling', () => {
    it('非 2xx で EsaHttpError が throw される (axios 互換形状)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'unauthorized', message: 'Invalid token' }),
      });

      const client = createEsaClient('bad-token');
      let caught: unknown;
      try {
        await client.get('/v1/teams/foo/posts');
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(EsaHttpError);
      const httpError = caught as EsaHttpError;
      expect(httpError.name).toBe('EsaHttpError');
      expect(httpError.message).toBe('unauthorized: Invalid token');
      expect(httpError.response.status).toBe(401);
      expect(httpError.response.data).toEqual({
        error: 'unauthorized',
        message: 'Invalid token',
      });
    });

    it('レスポンス body が JSON 解析不能でも落ちず EsaHttpError で包む', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('parse')),
      });

      const client = createEsaClient('test-token');
      let caught: unknown;
      try {
        await client.get('/v1/teams/foo/posts');
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(EsaHttpError);
      const httpError = caught as EsaHttpError;
      expect(httpError.response.status).toBe(500);
      expect(httpError.response.data).toEqual({});
    });
  });

  describe('authentication header', () => {
    it('異なる accessToken でクライアントを作れば別のトークンが送られる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const clientA = createEsaClient('token-a');
      const clientB = createEsaClient('token-b');

      await clientA.get('/v1/teams/foo/posts');
      await clientB.get('/v1/teams/foo/posts');

      const [, initA] = getFetchCallArgs(0);
      const [, initB] = getFetchCallArgs(1);
      expect(initA.headers).toMatchObject({ Authorization: 'Bearer token-a' });
      expect(initB.headers).toMatchObject({ Authorization: 'Bearer token-b' });
    });
  });
});
