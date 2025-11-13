import { vi } from 'vitest';

// Test setup file
// タイムゾーンをJSTに設定（本番環境と同じ設定）
process.env.TZ = 'Asia/Tokyo';

// Mock environment variables that are used in the functions
process.env.ESA_TEAM_NAME = 'test-team';
process.env.ESA_ACCESS_TOKEN = 'test-access-token';
process.env.VALID_EMAIL = 'test@example.com';

// Suppress console logs during tests unless explicitly needed
if (process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}
