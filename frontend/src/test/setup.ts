import '@testing-library/jest-dom'
import { vi } from 'vitest'


// Robust global fetch mock for all tests to avoid unhandled promise rejections and window errors
if (!(globalThis as any).fetch) {
  (globalThis as any).fetch = async (input?: string | Request, init?: { method?: string; body?: string }) => {
    // Return different mock data based on URL
    const url = typeof input === 'string' ? input : input?.toString() || '';
    if (url.includes('/api/persona')) {
      // Return empty persona list or a single persona for GET, or echo for POST/PUT
      if (init?.method === 'POST' || init?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ name: 'Test Persona', ...(init?.body ? JSON.parse(init.body) : {}) }),
          text: async () => '',
          status: 200,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
        text: async () => '',
        status: 200,
      });
    }
    if (url.includes('/api/artifacts/tree')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ name: 'root', path: '', type: 'folder', children: [] }),
        text: async () => '',
        status: 200,
      });
    }
    // Default mock
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
      text: async () => '',
      status: 200,
    });
  };
}

// Setup DOM globals
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock CSS imports globally
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))
