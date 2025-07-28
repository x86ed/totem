/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts', 'frontend/src/test/setup.ts'],
    include: [
      'scripts/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{test,spec}.{js,ts}',
      'frontend/src/context/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'frontend/src/components/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
      'scripts/__tests__/setup.ts',
      'scripts/__tests__/server.startup.test.ts'
    ],
  },
});
