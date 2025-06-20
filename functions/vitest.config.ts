import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 10,
        functions: 20,
        lines: 30,
        statements: 30,
      },
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  esbuild: {
    target: 'node22',
  },
});