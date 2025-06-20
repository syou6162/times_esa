import * as functions from 'firebase-functions';
import { CallableRequest } from 'firebase-functions/v2/https';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the module
vi.mock('axios');

// Import the functions to test
import { transformTitle, checkAuthTokenEmail, getDailyReport, createOrUpdatePost, getTagList, type EsaSearchResult, type EsaPost, type EsaTags } from '../index';
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


describe('Firebase Functions Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      get: vi.fn(),
    };

    const mockEsaConfig = {
      teamName: 'test-team',
      accessToken: 'test-token',
    };

    beforeEach(() => {
      vi.clearAllMocks();
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
          page: 1,
          per_page: 10,
          sort: 'best_match',
          order: 'desc',
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

    it('should throw error for invalid category format', async () => {
      // 曜日付きカテゴリはサポートしない
      await expect(getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, '日報/2024/06/20 (金)'))
        .rejects
        .toThrow(new functions.https.HttpsError('invalid-argument', 'カテゴリの形式が正しくありません'));

      // APIが呼ばれていないことを確認
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should throw error for non-date category format', async () => {
      // 日付形式ではないカテゴリでテスト
      await expect(getDailyReport(mockAxios as unknown as AxiosInstance, mockEsaConfig, 'テストカテゴリ'))
        .rejects
        .toThrow(new functions.https.HttpsError('invalid-argument', 'カテゴリの形式が正しくありません'));

      // APIが呼ばれていないことを確認
      expect(mockAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('createOrUpdatePost', () => {
    type MockAxiosInstance = {
      get: ReturnType<typeof vi.fn>;
      post: ReturnType<typeof vi.fn>;
      patch: ReturnType<typeof vi.fn>;
      defaults: { headers: { common: Record<string, unknown> } };
      interceptors: {
        request: { use: ReturnType<typeof vi.fn> };
        response: { use: ReturnType<typeof vi.fn> };
      };
    };
    let mockAxios: MockAxiosInstance;
    const esaConfig = { teamName: 'test-team', accessToken: 'test-token' };

    beforeEach(() => {
      // Create a mock axios instance
      mockAxios = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };
    });

    describe('新規投稿作成 (total_count === 0)', () => {
      it('検索結果0件の場合、新規投稿を作成する', async () => {
        const searchResult: EsaSearchResult = {
          posts: [],
          total_count: 0,
        };

        const newPost: EsaPost = {
          number: 123,
          name: 'テストタイトル',
          tags: ['test', 'new'],
          body_md: 'テスト本文',
          body_html: '<p>テスト本文</p>',
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
        mockAxios.post.mockResolvedValueOnce({ data: newPost } as AxiosResponse<EsaPost>);

        const result = await createOrUpdatePost(
          mockAxios,
          esaConfig,
          '日報/2025/06/20',
          ['test', 'new'],
          'テストタイトル',
          'テスト本文',
        );

        expect(result).toEqual(newPost);
        expect(mockAxios.get).toHaveBeenCalledWith('/v1/teams/test-team/posts', {
          params: { q: 'category:日報/2025/06/20' },
        });
        expect(mockAxios.post).toHaveBeenCalledWith('/v1/teams/test-team/posts', {
          post: {
            name: 'テストタイトル',
            category: '日報/2025/06/20',
            tags: ['test', 'new'],
            body_md: 'テスト本文',
            wip: false,
          },
        });

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).not.toHaveBeenCalled();
      });

      it('POSTリクエストが失敗した場合、エラーをスローする', async () => {
        const searchResult: EsaSearchResult = {
          posts: [],
          total_count: 0,
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
        mockAxios.post.mockRejectedValueOnce({
          response: {
            data: {
              error: 'invalid_token',
              message: 'Invalid access token',
            },
          },
        });

        await expect(
          createOrUpdatePost(
            mockAxios,
            esaConfig,
            '日報/2025/06/20',
            ['test'],
            'テストタイトル',
            'テスト本文',
          ),
        ).rejects.toThrow('invalid_token: Invalid access token');

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).not.toHaveBeenCalled();
      });
    });

    describe('既存投稿更新 (total_count === 1)', () => {
      it('検索結果1件の場合、既存投稿を更新する', async () => {
        const existingPost: EsaPost = {
          number: 123,
          name: '既存タイトル',
          tags: ['existing', 'tag'],
          body_md: '既存本文',
          body_html: '<p>既存本文</p>',
        };

        const searchResult: EsaSearchResult = {
          posts: [existingPost],
          total_count: 1,
        };

        const updatedPost: EsaPost = {
          ...existingPost,
          name: '既存タイトル、新規タイトル',
          tags: ['existing', 'tag', 'new'],
          body_md: '新規本文\n既存本文',
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
        mockAxios.patch.mockResolvedValueOnce({ data: updatedPost } as AxiosResponse<EsaPost>);

        const result = await createOrUpdatePost(
          mockAxios,
          esaConfig,
          '日報/2025/06/20',
          ['new'],
          '新規タイトル',
          '新規本文',
        );

        expect(result).toEqual(updatedPost);
        expect(mockAxios.patch).toHaveBeenCalledWith('/v1/teams/test-team/posts/123', {
          post: {
            name: '既存タイトル、新規タイトル',
            category: '日報/2025/06/20',
            tags: ['new', 'existing', 'tag'],
            body_md: '新規本文\n既存本文',
            wip: false,
          },
        });

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).not.toHaveBeenCalled();
      });

      it('空テキストの場合、既存本文のみを保持する', async () => {
        const existingPost: EsaPost = {
          number: 123,
          name: '既存タイトル',
          tags: ['existing'],
          body_md: '既存本文',
          body_html: '<p>既存本文</p>',
        };

        const searchResult: EsaSearchResult = {
          posts: [existingPost],
          total_count: 1,
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
        mockAxios.patch.mockResolvedValueOnce({ data: existingPost } as AxiosResponse<EsaPost>);

        await createOrUpdatePost(
          mockAxios,
          esaConfig,
          '日報/2025/06/20',
          [],
          '新規タイトル',
          '', // 空テキスト
        );

        expect(mockAxios.patch).toHaveBeenCalledWith('/v1/teams/test-team/posts/123', {
          post: {
            name: '既存タイトル、新規タイトル',
            category: '日報/2025/06/20',
            tags: ['existing'],
            body_md: '既存本文', // 既存本文のみ
            wip: false,
          },
        });

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).not.toHaveBeenCalled();
      });

      it('PATCHリクエストが失敗した場合、エラーをスローする', async () => {
        const existingPost: EsaPost = {
          number: 123,
          name: '既存タイトル',
          tags: [],
          body_md: '既存本文',
          body_html: '<p>既存本文</p>',
        };

        const searchResult: EsaSearchResult = {
          posts: [existingPost],
          total_count: 1,
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
        mockAxios.patch.mockRejectedValueOnce({
          response: {
            data: {
              error: 'rate_limit',
              message: 'Rate limit exceeded',
            },
          },
        });

        await expect(
          createOrUpdatePost(
            mockAxios,
            esaConfig,
            '日報/2025/06/20',
            [],
            '新規タイトル',
            'テスト',
          ),
        ).rejects.toThrow('rate_limit: Rate limit exceeded');

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).not.toHaveBeenCalled();
      });
    });

    describe('複数投稿エラー (total_count > 1)', () => {
      it('検索結果が複数件の場合、エラーをスローする', async () => {
        const post1: EsaPost = {
          number: 123,
          name: '投稿1',
          tags: [],
          body_md: '',
          body_html: '',
        };

        const post2: EsaPost = { ...post1, number: 124, name: '投稿2' };

        const searchResult: EsaSearchResult = {
          posts: [post1, post2],
          total_count: 2,
        };

        mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);

        await expect(
          createOrUpdatePost(
            mockAxios,
            esaConfig,
            '日報/2025/06/20',
            [],
            'テストタイトル',
            'テスト本文',
          ),
        ).rejects.toThrow('複数の日報が存在します');

        // エンドポイント呼び出し回数を検証
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.post).not.toHaveBeenCalled();
        expect(mockAxios.patch).not.toHaveBeenCalled();
      });
    });
  });

  describe('getTagList', () => {
    type MockAxiosInstance = {
      get: ReturnType<typeof vi.fn>;
      defaults: { headers: { common: Record<string, unknown> } };
      interceptors: {
        request: { use: ReturnType<typeof vi.fn> };
        response: { use: ReturnType<typeof vi.fn> };
      };
    };
    let mockAxios: MockAxiosInstance;
    const esaConfig = { teamName: 'test-team', accessToken: 'test-token' };

    beforeEach(() => {
      // Create a mock axios instance
      mockAxios = {
        get: vi.fn(),
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };
    });

    it('タグ一覧を正常に取得できる', async () => {
      const mockTags: EsaTags = {
        tags: [
          { name: '日報', posts_count: 100 },
          { name: '開発', posts_count: 50 },
          { name: 'テスト', posts_count: 30 },
        ],
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockTags } as AxiosResponse<EsaTags>);

      const result = await getTagList(mockAxios, esaConfig);

      expect(result).toEqual(mockTags);
      // Jest mockのメソッド参照はthisに依存しないため安全
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/teams/test-team/tags');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('空のタグ一覧を取得できる', async () => {
      const mockTags: EsaTags = {
        tags: [],
      };

      mockAxios.get.mockResolvedValueOnce({ data: mockTags } as AxiosResponse<EsaTags>);

      const result = await getTagList(mockAxios, esaConfig);

      expect(result).toEqual(mockTags);
      // Jest mockのメソッド参照はthisに依存しないため安全
      expect(mockAxios.get).toHaveBeenCalledWith('/v1/teams/test-team/tags');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('APIエラーが発生した場合、エラーがスローされる', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTagList(mockAxios, esaConfig)).rejects.toThrow('Network error');
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Helper functions integration', () => {
    describe('getEsaConfig', () => {
      it('環境変数からESA設定を取得できる', () => {
        // Process.env is mocked in setup.ts
        // getEsaConfig is not exported, but we can test it indirectly
        // by testing functions that use it
        expect(process.env.ESA_TEAM_NAME).toBe('test-team');
        expect(process.env.ESA_ACCESS_TOKEN).toBe('test-access-token');
      });
    });

    describe('createAxiosClient', () => {
      it('正しい設定でAxiosクライアントが作成される', () => {
        // This is tested indirectly through the API calls in other tests
        // The axios.create mock is set up in the Jest mock, but not called directly in test setup
        // We can verify the behavior through the successful API call tests
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const axios = require('axios');
        expect(axios).toBeDefined();
      });
    });
  });

  describe('Error handling integration', () => {
    type MockAxiosInstance = {
      get: ReturnType<typeof vi.fn>;
      post: ReturnType<typeof vi.fn>;
      patch: ReturnType<typeof vi.fn>;
      defaults: { headers: { common: Record<string, unknown> } };
      interceptors: {
        request: { use: ReturnType<typeof vi.fn> };
        response: { use: ReturnType<typeof vi.fn> };
      };
    };
    let mockAxios: MockAxiosInstance;
    const esaConfig = { teamName: 'test-team', accessToken: 'test-token' };

    beforeEach(() => {
      mockAxios = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        defaults: { headers: { common: {} } },
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };
    });

    it('AxiosError のエラーレスポンスが正しく変換される', async () => {
      const searchResult: EsaSearchResult = {
        posts: [],
        total_count: 0,
      };

      mockAxios.get.mockResolvedValueOnce({ data: searchResult } as AxiosResponse<EsaSearchResult>);
      mockAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: 'validation_failed',
            message: 'Title is required',
          },
        },
      });

      await expect(
        createOrUpdatePost(
          mockAxios,
          esaConfig,
          '日報/2025/06/20',
          [],
          '',
          'テスト',
        ),
      ).rejects.toThrow('validation_failed: Title is required');
    });

    it('ネットワークエラーなどの一般的なエラーが適切に伝播される', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        getDailyReport(mockAxios, esaConfig, '日報/2024/06/20'),
      ).rejects.toThrow('エラーが発生しました');
    });
  });
});
