import * as functions from 'firebase-functions';
import { CallableRequest } from 'firebase-functions/v2/https';

// Mock axios before importing the module
jest.mock('axios');

// Import the functions to test
import { transformTitle, checkAuthTokenEmail } from '../index';

describe('Firebase Functions Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transformTitle', () => {
    it('should return "日報" when both titles are "日報"', () => {
      expect(transformTitle('日報', '日報')).toBe('日報');
    });

    it('should remove "日報" and return other titles', () => {
      expect(transformTitle('日報', 'ミーティング')).toBe('ミーティング');
      expect(transformTitle('日報、開発', 'テスト')).toBe('開発、テスト');
    });

    it('should combine unique titles', () => {
      expect(transformTitle('開発', 'テスト')).toBe('開発、テスト');
      expect(transformTitle('開発、テスト', 'レビュー')).toBe('開発、テスト、レビュー');
    });

    it('should handle different separators (comma and Japanese comma)', () => {
      expect(transformTitle('開発, テスト', 'レビュー')).toBe('開発、テスト、レビュー');
      expect(transformTitle('開発,テスト', 'レビュー')).toBe('開発、テスト、レビュー');
    });

    it('should remove duplicates', () => {
      expect(transformTitle('開発', '開発')).toBe('開発');
      expect(transformTitle('開発、テスト', 'テスト')).toBe('開発、テスト');
    });

    it('should handle empty strings', () => {
      expect(transformTitle('', 'テスト')).toBe('テスト');
      expect(transformTitle('テスト', '')).toBe('テスト');
    });

    it('should keep "日報" when trying to change from other title to "日報"', () => {
      expect(transformTitle('開発', '日報')).toBe('開発');
      expect(transformTitle('開発、テスト', '日報')).toBe('開発、テスト');
    });

    it('should handle complex scenarios with "日報"', () => {
      // 日報が混在している場合
      expect(transformTitle('開発、日報', 'テスト')).toBe('開発、テスト');
      expect(transformTitle('日報、開発', '日報、テスト')).toBe('開発、テスト');
      
      // 一方が日報のみ、もう一方が日報を含む複数タイトル
      expect(transformTitle('日報', '日報、開発')).toBe('開発');
      expect(transformTitle('日報、開発', '日報')).toBe('開発');
    });

    it('should handle edge cases', () => {
      // 空文字列と日報 - 日報のみの場合は日報を返す
      expect(transformTitle('', '日報')).toBe('日報');
      expect(transformTitle('日報', '')).toBe('日報');
      
      // スペースのみ（現在の実装ではスペースは保持される）
      expect(transformTitle(' ', 'テスト')).toBe(' 、テスト');
      expect(transformTitle('テスト', ' ')).toBe('テスト、 ');
      
      // カンマやセパレータのみ（空文字列になるため除去される）
      expect(transformTitle(',', 'テスト')).toBe('テスト');
      expect(transformTitle('、', 'テスト')).toBe('テスト');
    });

    it('should handle "日報" as substring correctly', () => {
      // "日報"は独立した要素として扱われる（部分文字列としては扱われない）
      expect(transformTitle('毎日報告', 'テスト')).toBe('毎日報告、テスト');
      expect(transformTitle('日報会議', 'レビュー')).toBe('日報会議、レビュー');
      expect(transformTitle('営業日報', 'ミーティング')).toBe('営業日報、ミーティング');
      
      // 分割された要素が正確に"日報"の場合のみ特別扱い
      expect(transformTitle('日報、毎日報告', 'テスト')).toBe('毎日報告、テスト');
      expect(transformTitle('毎日報告、日報', 'レビュー')).toBe('毎日報告、レビュー');
    });
  });

  describe('checkAuthTokenEmail', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      process.env.VALID_EMAIL = 'valid@example.com';
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should pass when auth token email matches VALID_EMAIL', () => {
      const validContext = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'valid@example.com',
          },
        },
        rawRequest: {},
      } as unknown as CallableRequest;

      // Should not throw
      expect(() => checkAuthTokenEmail(validContext)).not.toThrow();
    });

    it('should throw permission-denied error when auth is missing', () => {
      const invalidContext = {
        rawRequest: {},
      } as unknown as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should throw permission-denied error when email does not match', () => {
      const invalidContext = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'invalid@example.com',
          },
        },
        rawRequest: {},
      } as unknown as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should throw when auth exists but token is missing', () => {
      const invalidContext = {
        auth: {
          uid: 'test-uid',
          token: {},
        },
        rawRequest: {},
      } as unknown as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should use VALID_EMAIL from environment', () => {
      process.env.VALID_EMAIL = 'different@example.com';
      
      const validContext = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'different@example.com',
          },
        },
        rawRequest: {},
      } as unknown as CallableRequest;

      expect(() => checkAuthTokenEmail(validContext)).not.toThrow();

      const invalidContext = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'valid@example.com',
          },
        },
        rawRequest: {},
      } as unknown as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow();
    });
  });
});