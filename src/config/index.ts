// 環境変数の設定を管理
export const config = {
  // モックAPIを使用するかどうか
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
  
  // Firebase設定
  firebase: {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  },
  
  // 認証設定
  validMailAddresses: import.meta.env.VITE_VALID_MAIL_ADDRESSES?.split(',') || [],
} as const;