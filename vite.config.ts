import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: "jsdom",
  }
})
