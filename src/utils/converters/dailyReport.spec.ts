import { describe, it, expect } from 'vitest';
import { 
  convertDailyReportResponse, 
  convertTagListResponse,
  convertRecentReportsResponse 
} from './dailyReport';
import { DailyReportResponseType, TagListResponseType, RecentDailyReportsResponse } from '../../types/api';

describe('dailyReport converters', () => {
  describe('convertDailyReportResponse', () => {
    it('API responseを正しくアプリ内部形式に変換する', () => {
      const apiResponse: DailyReportResponseType = {
        updated_at: '2024-06-20T10:00:00Z',
        url: 'https://example.esa.io/posts/123',
        body_md: '## 今日の作業\n- タスク1',
        body_html: '<h2>今日の作業</h2><ul><li>タスク1</li></ul>',
        tags: ['開発', 'times_esa'],
        name: '2024/06/20 日報',
        category: '日報/2024/06/20',
      };

      const result = convertDailyReportResponse(apiResponse);

      expect(result).toEqual({
        updatedAt: '2024-06-20T10:00:00Z',
        url: 'https://example.esa.io/posts/123',
        text: '## 今日の作業\n- タスク1',
        html: '<h2>今日の作業</h2><ul><li>タスク1</li></ul>',
        tags: ['開発', 'times_esa'],
        title: '2024/06/20 日報',
        category: '日報/2024/06/20',
      });
    });
  });

  describe('convertTagListResponse', () => {
    it('タグリストをそのまま返す', () => {
      const apiResponse: TagListResponseType = {
        tags: [
          { name: '開発', posts_count: 10 },
          { name: 'times_esa', posts_count: 20 },
        ],
      };

      const result = convertTagListResponse(apiResponse);

      expect(result).toEqual([
        { name: '開発', posts_count: 10 },
        { name: 'times_esa', posts_count: 20 },
      ]);
    });
  });

  describe('convertRecentReportsResponse', () => {
    it('最近の日報一覧を正しく変換する', () => {
      const apiResponse: RecentDailyReportsResponse = {
        reports: [
          {
            date: '2024-06-20',
            title: '開発、会議',
            posts_count: 5,
            tags: ['開発'],
            formatted_date: '6月20日(木)',
            url: 'https://example.esa.io/posts/123',
          },
          {
            date: '2024-06-19',
            title: 'レビュー、設計',
            posts_count: 3,
            tags: ['レビュー', '設計'],
            formatted_date: '6月19日(水)',
          },
        ],
        total_count: 2,
      };

      const result = convertRecentReportsResponse(apiResponse);

      expect(result).toEqual([
        {
          date: '2024-06-20',
          title: '開発、会議',
          postsCount: 5,
          tags: ['開発'],
          formattedDate: '6月20日(木)',
          url: 'https://example.esa.io/posts/123',
        },
        {
          date: '2024-06-19',
          title: 'レビュー、設計',
          postsCount: 3,
          tags: ['レビュー', '設計'],
          formattedDate: '6月19日(水)',
          url: undefined,
        },
      ]);
    });
  });
});