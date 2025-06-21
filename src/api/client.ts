import { config } from '../config';
import { FirebaseApiClient } from './clients/firebase';
import { MockApiClient } from './clients/mock';
import type { ApiClient } from './types';

// 環境に応じて適切なクライアントを作成
const createApiClient = (): ApiClient => {
  if (config.useMockApi) {
    return new MockApiClient();
  }
  return new FirebaseApiClient();
};

// シングルトンインスタンス
export const apiClient = createApiClient();