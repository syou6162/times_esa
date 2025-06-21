import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMultipleCategoryQuery, 
  extractDailyReportSummary,
  getRecentDailyReports 
} from '../recentDailyReports';
import * as search from '../search';
import type { EsaPostSnakeCase } from '../caseConverter';

// searchPostsをモック
vi.mock('../search');

describe('recentDailyReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMultipleCategoryQuery', () => {
    it('単一のカテゴリをon:クエリに変換する', () => {
      const query = createMultipleCategoryQuery(['日報/2024/06/20']);
      expect(query).toBe('on:日報/2024/06/20');
    });

    it('複数のカテゴリをOR結合したクエリに変換する', () => {
      const query = createMultipleCategoryQuery([
        '日報/2024/06/20',
        '日報/2024/06/19',
        '日報/2024/06/18'
      ]);
      expect(query).toBe('on:日報/2024/06/20 OR on:日報/2024/06/19 OR on:日報/2024/06/18');
    });

    it('空の配列の場合、空文字列を返す', () => {
      const query = createMultipleCategoryQuery([]);
      expect(query).toBe('');
    });
  });

  describe('extractDailyReportSummary', () => {
    it('ESA投稿から日報サマリーを抽出する', () => {
      const post = {
        number: 123,
        name: '開発、テスト',
        category: '日報/2024/06/20',
        updated_at: '2024-06-20T10:30:00+09:00',
        body_md: 'test',
        body_html: '<p>test</p>',
        tags: ['tag1']
      } as EsaPostSnakeCase & { category: string; updated_at: string };

      const summary = extractDailyReportSummary(post);
      
      expect(summary).toEqual({
        date: '2024-06-20',
        title: '開発、テスト',
        tags: ['tag1'],
        category: '日報/2024/06/20',
        updated_at: '2024-06-20T10:30:00+09:00',
        number: 123
      });
    });
  });

  describe('getRecentDailyReports', () => {
    it('過去の日報リストを取得する', async () => {
      const mockSearchResult = {
        posts: [
          {
            number: 123,
            name: '開発、テスト',
            category: '日報/2024/06/20',
            updated_at: '2024-06-20T10:30:00+09:00',
            body_md: 'test1',
            body_html: '<p>test1</p>',
            tags: ['tag1']
          },
          {
            number: 122,
            name: '設計',
            category: '日報/2024/06/19',
            updated_at: '2024-06-19T09:15:00+09:00',
            body_md: 'test2',
            body_html: '<p>test2</p>',
            tags: []
          }
        ],
        total_count: 2
      };

      const searchPostsMock = vi.mocked(search.searchPosts);
      searchPostsMock.mockResolvedValue(mockSearchResult);

      const result = await getRecentDailyReports(5);

      // searchPostsが正しいパラメータで呼ばれたか確認
      expect(searchPostsMock).toHaveBeenCalledWith({
        options: [{ query: expect.stringContaining('on:日報/') as string }],
        perPage: 5,
        sort: 'updated',
        order: 'desc'
      }, undefined);

      // 結果の確認
      expect(result.reports).toHaveLength(2);
      expect(result.reports[0]).toEqual({
        date: '2024-06-20',
        title: '開発、テスト',
        tags: ['tag1'],
        category: '日報/2024/06/20',
        updated_at: '2024-06-20T10:30:00+09:00',
        number: 123
      });
      expect(result.reports[1]).toEqual({
        date: '2024-06-19',
        title: '設計',
        tags: [],
        category: '日報/2024/06/19',
        updated_at: '2024-06-19T09:15:00+09:00',
        number: 122
      });
      expect(result.total_count).toBe(2);
    });

    it('日報以外の投稿をフィルタリングする', async () => {
      const mockSearchResult = {
        posts: [
          {
            number: 123,
            name: '開発日報',
            category: '日報/2024/06/20',
            updated_at: '2024-06-20T10:30:00+09:00',
            body_md: 'test1',
            body_html: '<p>test1</p>',
            tags: []
          },
          {
            number: 124,
            name: '会議メモ',
            category: 'ミーティング/2024/06/20',
            updated_at: '2024-06-20T11:00:00+09:00',
            body_md: 'test2',
            body_html: '<p>test2</p>',
            tags: []
          }
        ],
        total_count: 2
      };

      const searchPostsMock = vi.mocked(search.searchPosts);
      searchPostsMock.mockResolvedValue(mockSearchResult);

      const result = await getRecentDailyReports(5);

      // 日報のみが含まれることを確認
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].category).toBe('日報/2024/06/20');
    });

    it('0件の場合、空の配列を返す', async () => {
      const mockSearchResult = {
        posts: [],
        total_count: 0
      };

      const searchPostsMock = vi.mocked(search.searchPosts);
      searchPostsMock.mockResolvedValue(mockSearchResult);

      const result = await getRecentDailyReports(10);

      expect(result.reports).toHaveLength(0);
      expect(result.total_count).toBe(0);
    });
  });
});