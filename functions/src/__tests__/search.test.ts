import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPosts, searchDailyReport } from '../search';
import { type SearchOption } from '../searchOptions';
import type { AxiosInstance } from 'axios';
import type { EsaSearchResult } from '../index';

// モック用のAxiosクライアント
const mockAxiosClient = {
  get: vi.fn()
} as unknown as AxiosInstance;

// モック用のESA設定
vi.mock('../index', () => ({
  getEsaConfig: () => ({
    accessToken: 'test-token',
    teamName: 'test-team'
  }),
  createAxiosClient: () => mockAxiosClient
}));

describe('search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPosts', () => {
    it('単一のオプションで検索できる', async () => {
      const mockResponse: EsaSearchResult = {
        posts: [
          {
            number: 1,
            name: 'テスト投稿',
            body_md: '# テスト',
            body_html: '<h1>テスト</h1>',
            tags: ['test']
          }
        ],
        total_count: 1
      };

      (mockAxiosClient.get as any).mockResolvedValueOnce({ data: mockResponse });

      const options: SearchOption[] = [
        { query: 'in:日報/2024/06' }
      ];

      const result = await searchPosts({ options }, mockAxiosClient);

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/teams/test-team/posts',
        {
          params: {
            q: 'in:日報/2024/06',
            page: 1,
            per_page: 20,
            sort: 'best_match',
            order: 'desc'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('複数のオプションを組み合わせて検索できる', async () => {
      const mockResponse: EsaSearchResult = {
        posts: [],
        total_count: 0
      };

      (mockAxiosClient.get as any).mockResolvedValueOnce({ data: mockResponse });

      const options: SearchOption[] = [
        { query: 'in:日報/2024/06' },
        { query: 'tag:重要' },
        { query: 'wip:false' }
      ];

      const result = await searchPosts({ 
        options,
        page: 2,
        perPage: 50,
        sort: 'created',
        order: 'asc'
      }, mockAxiosClient);

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/teams/test-team/posts',
        {
          params: {
            q: 'in:日報/2024/06 tag:重要 wip:false',
            page: 2,
            per_page: 50,
            sort: 'created',
            order: 'asc'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('空のオプションでも検索できる', async () => {
      const mockResponse: EsaSearchResult = {
        posts: [],
        total_count: 0
      };

      (mockAxiosClient.get as any).mockResolvedValueOnce({ data: mockResponse });

      const result = await searchPosts({ options: [] }, mockAxiosClient);

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/teams/test-team/posts',
        {
          params: {
            q: '',
            page: 1,
            per_page: 20,
            sort: 'best_match',
            order: 'desc'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('エラーを正しく処理する', async () => {
      const error = new Error('API Error');
      (mockAxiosClient.get as any).mockRejectedValueOnce(error);

      await expect(
        searchPosts({ options: [] }, mockAxiosClient)
      ).rejects.toThrow('API Error');
    });
  });

  describe('searchDailyReport', () => {
    it('指定した日付の日報を検索できる', async () => {
      const mockResponse: EsaSearchResult = {
        posts: [
          {
            number: 123,
            name: '6月20日 (木)',
            body_md: '日報内容',
            body_html: '<p>日報内容</p>',
            tags: []
          }
        ],
        total_count: 1
      };

      (mockAxiosClient.get as any).mockResolvedValueOnce({ data: mockResponse });

      const result = await searchDailyReport('2024-06-20', mockAxiosClient);

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/teams/test-team/posts',
        {
          params: {
            q: 'in:日報/2024/06 title:6月20日',
            page: 1,
            per_page: 10,
            sort: 'best_match',
            order: 'desc'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('月と日の先頭の0を除去して検索する', async () => {
      const mockResponse: EsaSearchResult = {
        posts: [],
        total_count: 0
      };

      (mockAxiosClient.get as any).mockResolvedValueOnce({ data: mockResponse });

      await searchDailyReport('2024-01-05', mockAxiosClient);

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        '/teams/test-team/posts',
        {
          params: {
            q: 'in:日報/2024/01 title:1月5日',
            page: 1,
            per_page: 10,
            sort: 'best_match',
            order: 'desc'
          }
        }
      );
    });
  });
});