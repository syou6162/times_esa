import { describe, it, expect } from 'vitest';
import {
  formatDateToCategory,
  formatCategoryToDate,
  formatDateStringToCategory,
  getDateRangeCategories,
  getDateRangeCategoriesBetween,
  isDailyReportCategory
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDateToCategory', () => {
    it('Dateオブジェクトを日報カテゴリ形式に変換できる', () => {
      const date = new Date('2024-06-20');
      expect(formatDateToCategory(date)).toBe('日報/2024/06/20');
    });

    it('月と日が1桁の場合、0埋めされる', () => {
      const date = new Date('2024-01-05');
      expect(formatDateToCategory(date)).toBe('日報/2024/01/05');
    });
  });

  describe('formatCategoryToDate', () => {
    it('日報カテゴリ形式をyyyy-MM-dd形式に変換できる', () => {
      expect(formatCategoryToDate('日報/2024/06/20')).toBe('2024-06-20');
    });

    it('不正な形式の場合、エラーをスローする', () => {
      expect(() => formatCategoryToDate('日報/2024/6/20')).toThrow('カテゴリの形式が正しくありません');
      expect(() => formatCategoryToDate('日報/2024/06')).toThrow('カテゴリの形式が正しくありません');
      expect(() => formatCategoryToDate('2024/06/20')).toThrow('カテゴリの形式が正しくありません');
    });
  });

  describe('formatDateStringToCategory', () => {
    it('yyyy-MM-dd形式を日報カテゴリ形式に変換できる', () => {
      expect(formatDateStringToCategory('2024-06-20')).toBe('日報/2024/06/20');
      expect(formatDateStringToCategory('2024-01-05')).toBe('日報/2024/01/05');
    });
  });

  describe('getDateRangeCategories', () => {
    it('デフォルトで10日分の日報カテゴリを生成する（今日を除く）', () => {
      const baseDate = new Date('2024-06-20');
      const categories = getDateRangeCategories(10, baseDate);
      
      expect(categories).toHaveLength(10);
      expect(categories[0]).toBe('日報/2024/06/19');
      expect(categories[9]).toBe('日報/2024/06/10');
    });

    it('指定された日数分の日報カテゴリを生成する（今日を除く）', () => {
      const baseDate = new Date('2024-06-20');
      const categories = getDateRangeCategories(5, baseDate);
      
      expect(categories).toHaveLength(5);
      expect(categories[0]).toBe('日報/2024/06/19');
      expect(categories[4]).toBe('日報/2024/06/15');
    });

    it('月をまたぐ場合も正しく生成される（今日を除く）', () => {
      const baseDate = new Date('2024-07-02');
      const categories = getDateRangeCategories(5, baseDate);
      
      expect(categories).toHaveLength(5);
      expect(categories[0]).toBe('日報/2024/07/01');
      expect(categories[4]).toBe('日報/2024/06/27');
    });

    it('年をまたぐ場合も正しく生成される（今日を除く）', () => {
      const baseDate = new Date('2025-01-02');
      const categories = getDateRangeCategories(5, baseDate);
      
      expect(categories).toHaveLength(5);
      expect(categories[0]).toBe('日報/2025/01/01');
      expect(categories[4]).toBe('日報/2024/12/28');
    });
  });

  describe('getDateRangeCategoriesBetween', () => {
    it('2つの日付間の日報カテゴリを生成する', () => {
      const categories = getDateRangeCategoriesBetween('2024-06-18', '2024-06-20');
      
      expect(categories).toHaveLength(3);
      expect(categories[0]).toBe('日報/2024/06/20');
      expect(categories[1]).toBe('日報/2024/06/19');
      expect(categories[2]).toBe('日報/2024/06/18');
    });

    it('開始日と終了日が同じ場合、1つのカテゴリを返す', () => {
      const categories = getDateRangeCategoriesBetween('2024-06-20', '2024-06-20');
      
      expect(categories).toHaveLength(1);
      expect(categories[0]).toBe('日報/2024/06/20');
    });

    it('開始日が終了日より後の場合、エラーをスローする', () => {
      expect(() => getDateRangeCategoriesBetween('2024-06-21', '2024-06-20'))
        .toThrow('開始日は終了日より前である必要があります');
    });
  });

  describe('isDailyReportCategory', () => {
    it('正しい日報カテゴリ形式の場合、trueを返す', () => {
      expect(isDailyReportCategory('日報/2024/06/20')).toBe(true);
      expect(isDailyReportCategory('日報/2024/01/01')).toBe(true);
      expect(isDailyReportCategory('日報/2024/12/31')).toBe(true);
    });

    it('不正な形式の場合、falseを返す', () => {
      expect(isDailyReportCategory('日報/2024/6/20')).toBe(false);
      expect(isDailyReportCategory('日報/2024/06')).toBe(false);
      expect(isDailyReportCategory('2024/06/20')).toBe(false);
      expect(isDailyReportCategory('日報/2024/06/20 (金)')).toBe(false);
      expect(isDailyReportCategory('ミーティング/2024/06/20')).toBe(false);
      expect(isDailyReportCategory('')).toBe(false);
    });
  });
});
