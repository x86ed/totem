import { vi, beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
});
