import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/__tests__/**/*.test.ts'],
    coverage: {
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/**/*.d.ts', 'scripts/__tests__/**'],
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['scripts/__tests__/setup.ts'],
    testTimeout: 10000,
  },
});
