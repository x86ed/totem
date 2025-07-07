import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch for Node test environment
(globalThis as any).fetch = (globalThis as any).fetch || (() => Promise.resolve({
  json: () => Promise.resolve({ name: 'root', path: '', type: 'folder', children: [] }),
  ok: true,
}));

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
