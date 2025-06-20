import { describe, it, expect } from 'vitest';
import {
  withCategory,
  withTags,
  withDateRange,
  withTitle,
  combineOptions,
  type SearchOption
} from '../searchOptions';

describe('searchOptions', () => {
  describe('combineOptions', () => {
    it('空の配列を渡すと空文字列を返す', () => {
      expect(combineOptions([])).toBe('');
    });

    it('単一のオプションを正しく返す', () => {
      const options: SearchOption[] = [{ query: 'in:日報' }];
      expect(combineOptions(options)).toBe('in:日報');
    });

    it('複数のオプションをスペースで結合する', () => {
      const options: SearchOption[] = [
        { query: 'in:日報' },
        { query: 'tag:重要' },
        { query: 'wip:false' }
      ];
      expect(combineOptions(options)).toBe('in:日報 tag:重要 wip:false');
    });

    it('空のクエリを持つオプションを除外する', () => {
      const options: SearchOption[] = [
        { query: 'in:日報' },
        { query: '' },
        { query: 'tag:重要' }
      ];
      expect(combineOptions(options)).toBe('in:日報 tag:重要');
    });
  });

  describe('withCategory', () => {
    it('カテゴリ名を正しくフォーマットする', () => {
      expect(withCategory('日報/2024/06')).toEqual({ query: 'in:日報/2024/06' });
    });

    it('空文字列を渡すと空のクエリを返す', () => {
      expect(withCategory('')).toEqual({ query: '' });
    });

    it('スペースを含むカテゴリ名も処理できる', () => {
      expect(withCategory('開発 メモ')).toEqual({ query: 'in:開発 メモ' });
    });
  });

  describe('withTags', () => {
    it('単一のタグを正しくフォーマットする', () => {
      expect(withTags(['重要'])).toEqual({ query: 'tag:重要' });
    });

    it('複数のタグをスペースで結合する', () => {
      expect(withTags(['重要', '緊急', 'バグ'])).toEqual({ 
        query: 'tag:重要 tag:緊急 tag:バグ' 
      });
    });

    it('空の配列を渡すと空のクエリを返す', () => {
      expect(withTags([])).toEqual({ query: '' });
    });

    it('nullまたはundefinedを渡すと空のクエリを返す', () => {
      expect(withTags(null as any)).toEqual({ query: '' });
      expect(withTags(undefined as any)).toEqual({ query: '' });
    });
  });

  describe('withDateRange', () => {
    it('開始日のみを指定できる', () => {
      expect(withDateRange('2024-06-01')).toEqual({ 
        query: 'created:>=2024-06-01' 
      });
    });

    it('終了日のみを指定できる', () => {
      expect(withDateRange(undefined, '2024-06-30')).toEqual({ 
        query: 'created:<=2024-06-30' 
      });
    });

    it('開始日と終了日の両方を指定できる', () => {
      expect(withDateRange('2024-06-01', '2024-06-30')).toEqual({ 
        query: 'created:>=2024-06-01 created:<=2024-06-30' 
      });
    });

    it('どちらも指定しないと空のクエリを返す', () => {
      expect(withDateRange()).toEqual({ query: '' });
    });
  });

  describe('withTitle', () => {
    it('タイトル検索クエリを正しくフォーマットする', () => {
      expect(withTitle('日報')).toEqual({ query: 'title:日報' });
    });

    it('空文字列を渡すと空のクエリを返す', () => {
      expect(withTitle('')).toEqual({ query: '' });
    });

    it('スペースを含むタイトルも処理できる', () => {
      expect(withTitle('2024年6月 日報')).toEqual({ 
        query: 'title:2024年6月 日報' 
      });
    });
  });


  describe('複合的な使用例', () => {
    it('複数の検索オプションを組み合わせて使用できる', () => {
      const options: SearchOption[] = [
        withCategory('日報/2024/06'),
        withTags(['重要', '緊急']),
        withDateRange('2024-06-01', '2024-06-30'),
        withTitle('6月20日')
      ];
      
      const combinedQuery = combineOptions(options);
      expect(combinedQuery).toBe(
        'in:日報/2024/06 tag:重要 tag:緊急 created:>=2024-06-01 created:<=2024-06-30 title:6月20日'
      );
    });

    it('一部のオプションが空でも正しく動作する', () => {
      const options: SearchOption[] = [
        withCategory('日報'),
        withTags([]),  // 空のタグ
        withDateRange('2024-06-01'),  // 終了日なし
        withTitle('')  // 空のタイトル
      ];
      
      const combinedQuery = combineOptions(options);
      expect(combinedQuery).toBe('in:日報 created:>=2024-06-01');
    });
  });
});