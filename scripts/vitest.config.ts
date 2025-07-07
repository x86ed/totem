import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Point to the correct tsconfig for decorators
    tsconfig: '../tsconfig.scripts.json',
  },
});
