import { describe, it, expect } from 'vitest';
import {
  getPostsCount,
  formatDateToJapanese,
  formatPostsCountText,
  formatTodayPostsText,
  generateMockDailyReportUrl,
  generateMockUpdatedAt,
} from './dailyReportUtils';

describe('dailyReportUtils', () => {
  describe('getPostsCount', () => {
    it('空文字列の場合は1を返す', () => {
      expect(getPostsCount('')).toBe(1);
    });

    it('区切り文字がない場合は1を返す', () => {
      expect(getPostsCount('単一のつぶやき')).toBe(1);
    });

    it('区切り文字がある場合は正しいカウントを返す', () => {
      expect(getPostsCount('つぶやき1\n---\nつぶやき2')).toBe(2);
      expect(getPostsCount('つぶやき1\n---\nつぶやき2\n---\nつぶやき3')).toBe(3);
    });

    it('複数の区切り文字がある場合も正しくカウントする', () => {
      expect(getPostsCount('1\n---\n2\n---\n3\n---\n4\n---\n5')).toBe(5);
    });
  });

  describe('formatDateToJapanese', () => {
    it('日付文字列を日本語形式にフォーマットする', () => {
      expect(formatDateToJapanese('2024-06-19')).toBe('6月19日(水)');
      expect(formatDateToJapanese('2024-12-25')).toBe('12月25日(水)');
      expect(formatDateToJapanese('2024-01-01')).toBe('1月1日(月)');
    });
  });

  describe('formatPostsCountText', () => {
    it('つぶやき数のテキストを正しくフォーマットする', () => {
      expect(formatPostsCountText(1)).toBe('1個のつぶやき');
      expect(formatPostsCountText(5)).toBe('5個のつぶやき');
      expect(formatPostsCountText(0)).toBe('0個のつぶやき');
    });
  });

  describe('formatTodayPostsText', () => {
    it('今日のつぶやき数のテキストを正しくフォーマットする', () => {
      expect(formatTodayPostsText(1)).toBe('今日は1個つぶやいたよ');
      expect(formatTodayPostsText(3)).toBe('今日は3個つぶやいたよ');
      expect(formatTodayPostsText(0)).toBe('今日は0個つぶやいたよ');
    });
  });

  describe('generateMockDailyReportUrl', () => {
    it('モック用のURLを正しく生成する', () => {
      expect(generateMockDailyReportUrl('2024-06-19')).toBe('https://example.esa.io/posts/mock-2024-06-19');
      expect(generateMockDailyReportUrl('2024-12-25')).toBe('https://example.esa.io/posts/mock-2024-12-25');
    });
  });

  describe('generateMockUpdatedAt', () => {
    it('モック用の更新日時を正しく生成する', () => {
      expect(generateMockUpdatedAt('2024-06-19')).toBe('2024-06-19T18:00:00+09:00');
      expect(generateMockUpdatedAt('2024-12-25')).toBe('2024-12-25T18:00:00+09:00');
    });
  });
});