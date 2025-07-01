import { vi } from 'vitest'

// Mock CSS imports (if any backend code imports CSS)
vi.mock('*.css', () => ({}))

// Setup Node.js test environment
// Add any global mocks or setup needed for backend tests here
