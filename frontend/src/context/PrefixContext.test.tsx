import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import usePrefix from './usePrefix';
import { PrefixProvider } from './PrefixContext';
import { vi } from 'vitest';

// Helper component to test context
const TestConsumer: React.FC = () => {
  const { prefix, setPrefix, loading } = usePrefix();
  return (
    <div>
      <span data-testid="prefix">{prefix}</span>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <button data-testid="setPrefix" onClick={() => setPrefix('NEWPRF')}>Set Prefix</button>
    </div>
  );
};

describe('PrefixContext', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/prefix') && (!init || init.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prefix: 'TEST' })
        }) as unknown as Response;
      }
      if (url.includes('/api/prefix') && init && init.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prefix: JSON.parse(init.body as string).prefix })
        }) as unknown as Response;
      }
      return Promise.reject('Unknown endpoint');
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('loads prefix from API and provides it in context', async () => {
    const { getByTestId } = render(
      <PrefixProvider>
        <TestConsumer />
      </PrefixProvider>
    );
    expect(getByTestId('loading').textContent).toBe('loading');
    await waitFor(() => expect(getByTestId('prefix').textContent).toBe('TEST'));
    expect(getByTestId('loading').textContent).toBe('loaded');
  });

  it('updates prefix via setPrefix and disables loading after', async () => {
    const { getByTestId } = render(
      <PrefixProvider>
        <TestConsumer />
      </PrefixProvider>
    );
    await waitFor(() => expect(getByTestId('prefix').textContent).toBe('TEST'));
    act(() => {
      getByTestId('setPrefix').click();
    });
    await waitFor(() => expect(getByTestId('prefix').textContent).toBe('NEWPRF'));
    expect(getByTestId('loading').textContent).toBe('loaded');
  });

  it('throws error if usePrefix is used outside provider', () => {
    // Suppress error output for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    spy.mockRestore();
  });
});
