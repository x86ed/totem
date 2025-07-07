import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Remove unsupported tsconfig option for Vitest 1.x+
    // TypeScript config is picked up automatically from tsconfig.json hierarchy
  },
});
