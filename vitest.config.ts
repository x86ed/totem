/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test-setup.ts'],
    include: [
      'scripts/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'frontend/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'scripts/__tests__/setup.ts',
      'scripts/__tests__/server.startup.test.ts'
    ],
  },
});
