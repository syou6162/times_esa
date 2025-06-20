import * as functions from 'firebase-functions';
import { CallableRequest } from 'firebase-functions/v2/https';

// Mock axios before importing the module
jest.mock('axios');

// Import the functions to test
import { transformTitle, checkAuthTokenEmail, getDailyReport, type EsaSearchResult, type EsaPost } from '../index';
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

    it('should handle parallel editing patterns correctly', () => {
      // 並行編集パターン：すべての要素を保持
      // ケース1: 共通の開始部分がある場合
      expect(transformTitle('開発、設計', '開発、テスト')).toBe('開発、設計、テスト');
      
      // ケース2: より複雑な共通要素
      expect(transformTitle('開発、設計、テスト', '開発、レビュー、デプロイ')).toBe('開発、設計、テスト、レビュー、デプロイ');
      
      // ケース3: 一部の要素が共通（順序が異なる）
      expect(transformTitle('a,b,c', 'a,d,e')).toBe('a、b、c、d、e');
      
      // ケース4: 中間の要素が共通
      expect(transformTitle('a,b,c', 'd,b')).toBe('a、b、c、d');
      
      // ケース5: 完全包含も並行編集として扱う
      expect(transformTitle('開発', '開発、テスト')).toBe('開発、テスト');
      expect(transformTitle('開発、テスト', '開発、テスト、レビュー')).toBe('開発、テスト、レビュー');
    });

    it('should document parallel editing behavior', () => {
      // このテストは仕様を文書化するためのもの
      // times_esaでは情報の喪失を防ぐため、すべての要素を保持する
      
      // 例1: 異なるセッションが異なる作業を追加
      const session1 = '開発、バグ修正';
      const session2 = '開発、新機能追加';
      expect(transformTitle(session1, session2)).toBe('開発、バグ修正、新機能追加');
      
      // 例2: 意図的な置き換えはesa.io本体で行うため、ここでは考慮しない
      const original = '設計、実装、テスト';
      const updated = '設計、レビュー、デプロイ';
      // 置き換えではなく、すべての要素を保持
      expect(transformTitle(original, updated)).toBe('設計、実装、テスト、レビュー、デプロイ');
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

  describe('getDailyReport', () => {
    // Axiosモックのタイプ定義
    const mockAxios = {
      get: jest.fn(),
    };

    const mockEsaConfig = {
      teamName: 'test-team',
      accessToken: 'test-token',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return post data when exactly one daily report exists', async () => {
      // 検索APIのレスポンス（1件の日報）
      const mockPost: EsaPost = {
        body_md: '# 日報\n\n今日の作業内容',
        body_html: '<h1>日報</h1><p>今日の作業内容</p>',
        number: 123,
        name: '日報 2024-06-20',
        tags: ['日報', '開発'],
      };

      const searchResult: EsaSearchResult = {
        posts: [mockPost],
        total_count: 1,
      };

      const searchResponse: AxiosResponse<EsaSearchResult> = {
        data: searchResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      const detailResponse: AxiosResponse<EsaPost> = {
        data: mockPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      // モックの設定
      mockAxios.get
        .mockResolvedValueOnce(searchResponse) // 最初の呼び出し（検索）
        .mockResolvedValueOnce(detailResponse); // 2回目の呼び出し（詳細取得）

      // 実行
      const result = await getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, '日報/2024/06/20');

      // 検証
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      
      // 検索API呼び出しの検証
      expect(mockAxios.get).toHaveBeenNthCalledWith(1, '/v1/teams/test-team/posts', {
        params: {
          q: 'category:日報/2024/06/20',
        },
      });

      // 詳細取得API呼び出しの検証
      expect(mockAxios.get).toHaveBeenNthCalledWith(2, '/v1/teams/test-team/posts/123');

      // 結果の検証
      expect(result).toEqual(mockPost);
    });

    it('should throw not-found error when no daily report exists', async () => {
      // 検索APIのレスポンス（0件）
      const searchResult: EsaSearchResult = {
        posts: [],
        total_count: 0,
      };

      const searchResponse: AxiosResponse<EsaSearchResult> = {
        data: searchResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      mockAxios.get.mockResolvedValueOnce(searchResponse);

      // 実行と検証
      await expect(getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, '日報/2024/06/20'))
        .rejects
        .toThrow(new functions.https.HttpsError('not-found', '今日の日報はまだありません'));

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw already-exists error when multiple daily reports exist', async () => {
      // 検索APIのレスポンス（複数件）
      const mockPosts: EsaPost[] = [
        {
          body_md: 'post1',
          body_html: '<p>post1</p>',
          number: 123,
          name: '日報1',
          tags: [],
        },
        {
          body_md: 'post2',
          body_html: '<p>post2</p>',
          number: 124,
          name: '日報2',
          tags: [],
        },
      ];

      const searchResult: EsaSearchResult = {
        posts: mockPosts,
        total_count: 2,
      };

      const searchResponse: AxiosResponse<EsaSearchResult> = {
        data: searchResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      mockAxios.get.mockResolvedValueOnce(searchResponse);

      // 実行と検証
      await expect(getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, '日報/2024/06/20'))
        .rejects
        .toThrow(new functions.https.HttpsError('already-exists', '複数の日報が存在します'));

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should correctly build request parameters with special characters in category', async () => {
      const mockPost: EsaPost = {
        body_md: 'test',
        body_html: '<p>test</p>',
        number: 125,
        name: 'test',
        tags: [],
      };

      const searchResult: EsaSearchResult = {
        posts: [mockPost],
        total_count: 1,
      };

      const searchResponse: AxiosResponse<EsaSearchResult> = {
        data: searchResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      const detailResponse: AxiosResponse<EsaPost> = {
        data: mockPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      mockAxios.get
        .mockResolvedValueOnce(searchResponse)
        .mockResolvedValueOnce(detailResponse);

      // カテゴリに特殊文字を含む場合
      await getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, '日報/2024/06/20 (金)');

      // パラメータが正しく設定されることを確認
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/teams/test-team/posts', {
        params: {
          q: 'category:日報/2024/06/20 (金)',
        },
      });
    });

    it('should fail when incorrect request parameters are used', async () => {
      const mockPost: EsaPost = {
        body_md: 'test',
        body_html: '<p>test</p>',
        number: 126,
        name: 'test',
        tags: [],
      };

      const searchResult: EsaSearchResult = {
        posts: [mockPost],
        total_count: 1,
      };

      const searchResponse: AxiosResponse<EsaSearchResult> = {
        data: searchResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      const detailResponse: AxiosResponse<EsaPost> = {
        data: mockPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as InternalAxiosRequestConfig,
      };

      mockAxios.get
        .mockResolvedValueOnce(searchResponse)
        .mockResolvedValueOnce(detailResponse);

      await getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, 'テストカテゴリ');

      // 間違ったパラメータ名でテスト（これは失敗するはず）
      expect(mockAxios.get).not.toHaveBeenCalledWith('/v1/teams/test-team/posts', {
        params: {
          query: 'category:テストカテゴリ', // 'q' ではなく 'query'
        },
      });

      // 正しいパラメータ名でテスト
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/teams/test-team/posts', {
        params: {
          q: 'category:テストカテゴリ',
        },
      });
    });
  });
});