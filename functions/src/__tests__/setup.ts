// Test setup file
// Mock environment variables that are used in the functions
process.env.ESA_TEAM_NAME = 'test-team';
process.env.ESA_ACCESS_TOKEN = 'test-access-token';
process.env.VALID_EMAIL = 'test@example.com';

// Suppress console logs during tests unless explicitly needed
if (process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}