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
      const validContext: CallableRequest = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'valid@example.com',
          } as any,
        },
        rawRequest: {} as any,
      } as CallableRequest;

      // Should not throw
      expect(() => checkAuthTokenEmail(validContext)).not.toThrow();
    });

    it('should throw permission-denied error when auth is missing', () => {
      const invalidContext: CallableRequest = {
        rawRequest: {} as any,
      } as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should throw permission-denied error when email does not match', () => {
      const invalidContext: CallableRequest = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'invalid@example.com',
          } as any,
        },
        rawRequest: {} as any,
      } as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should throw when auth exists but token is missing', () => {
      const invalidContext: CallableRequest = {
        auth: {
          uid: 'test-uid',
          token: {} as any,
        },
        rawRequest: {} as any,
      } as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow(
        new functions.https.HttpsError('permission-denied', 'Auth Error')
      );
    });

    it('should use VALID_EMAIL from environment', () => {
      process.env.VALID_EMAIL = 'different@example.com';
      
      const validContext: CallableRequest = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'different@example.com',
          } as any,
        },
        rawRequest: {} as any,
      } as CallableRequest;

      expect(() => checkAuthTokenEmail(validContext)).not.toThrow();

      const invalidContext: CallableRequest = {
        auth: {
          uid: 'test-uid',
          token: {
            email: 'valid@example.com',
          } as any,
        },
        rawRequest: {} as any,
      } as CallableRequest;

      expect(() => checkAuthTokenEmail(invalidContext)).toThrow();
    });
  });
});