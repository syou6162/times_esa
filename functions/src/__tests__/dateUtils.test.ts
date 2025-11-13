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

    // TDDテスト: JST早朝のタイムゾーンバグを再現
    it('JST早朝（UTC前日夜）でも正しくJST基準で昨日の日報を含む', () => {
      // 実際のバグシナリオ:
      // JST: 2024-11-13 08:00（朝8時） - ユーザーがアクセスした時刻
      // UTC: 2024-11-12 23:00（前日夜11時） - Firebase Functionsのタイムゾーン

      // Firebase Functions上では new Date() がUTCで解釈されるため、
      // このタイムスタンプは getDate() で 12 を返す
      const utcEarlyMorningJST = new Date('2024-11-12T23:00:00Z'); // UTC 11/12 23:00 = JST 11/13 08:00
      const categories = getDateRangeCategories(3, utcEarlyMorningJST);

      // 期待値: JST基準で「今日」は11/13なので、昨日（11/12）から始まるべき
      expect(categories).toEqual([
        '日報/2024/11/12', // JST基準の昨日
        '日報/2024/11/11', // 一昨日
        '日報/2024/11/10'  // 3日前
      ]);

      // 現在の実装の挙動: UTC基準で「今日」が11/12なので、昨日（11/11）から始まってしまう
      // 実際の結果: ['日報/2024/11/11', '日報/2024/11/10', '日報/2024/11/09']
      // これにより JST 11/12（昨日）の日報が検索対象から漏れる
    });

    it('JST日中（UTC同日）の場合は正しく動作する', () => {
      // JST: 2024-11-13 15:00（午後3時）
      // UTC: 2024-11-13 06:00（朝6時）
      const utcAfternoonJST = new Date('2024-11-13T06:00:00Z'); // UTC 11/13 06:00 = JST 11/13 15:00
      const categories = getDateRangeCategories(3, utcAfternoonJST);

      // この場合は現在の実装でも正しく動作する（UTCとJSTで日付が一致）
      expect(categories).toEqual([
        '日報/2024/11/12',
        '日報/2024/11/11',
        '日報/2024/11/10'
      ]);
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
