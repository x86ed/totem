/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts', './src/setupTests.ts'],
    include: [
      'scripts/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{test,spec}.{js,ts}',
      'frontend/src/context/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'frontend/src/components/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'vite.config.ts',
        'eslint.config.js'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
})
