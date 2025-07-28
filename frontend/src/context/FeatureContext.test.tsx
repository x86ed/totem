
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { FeatureProvider, FeatureContext, FeatureItem, FeatureContextType } from './FeatureContext';

// Mock fetch
const globalAny = global as typeof globalThis & { fetch: any };
beforeEach(() => {
  globalAny.fetch = vi.fn();
});
afterEach(() => {
  vi.resetAllMocks();
});

describe('FeatureContext', () => {
  it('fetches features on mount', async () => {
    const features: FeatureItem[] = [
      { key: 'login', description: 'desc' },
      { key: 'signup', description: 'desc2' }
    ];
    globalAny.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => features
    });
    let contextValue: FeatureContextType | undefined;
    await act(async () => {
      render(
        <FeatureProvider>
          <FeatureContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FeatureContext.Consumer>
        </FeatureProvider>
      );
    });
    expect(contextValue?.features).toEqual(features);
    expect(contextValue?.loading).toBe(false);
  });

  it('addFeature calls API and refreshes', async () => {
    const newFeature = { key: 'dashboard', description: 'desc' };
    globalAny.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // POST
      .mockResolvedValueOnce({ ok: true, json: async () => [newFeature] }); // refresh
    let contextValue: FeatureContextType | undefined;
    await act(async () => {
      render(
        <FeatureProvider>
          <FeatureContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FeatureContext.Consumer>
        </FeatureProvider>
      );
    });
    await act(async () => {
    await contextValue?.addFeature(newFeature);
    });
    expect(globalAny.fetch).toHaveBeenCalledWith('http://localhost:8080/api/feature', expect.objectContaining({ method: 'POST' }));
    expect(contextValue?.features).toEqual([newFeature]);
  });

  it('updateFeature calls API and refreshes', async () => {
    const feature = { key: 'login', description: 'desc' };
    const updated = { key: 'login', description: 'updated' };
    globalAny.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [feature] }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // PUT
      .mockResolvedValueOnce({ ok: true, json: async () => [updated] }); // refresh
    let contextValue: FeatureContextType | undefined;
    await act(async () => {
      render(
        <FeatureProvider>
          <FeatureContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FeatureContext.Consumer>
        </FeatureProvider>
      );
    });
    await act(async () => {
    await contextValue?.updateFeature('login', updated);
    });
    expect(globalAny.fetch).toHaveBeenCalledWith('http://localhost:8080/api/feature/login', expect.objectContaining({ method: 'PUT' }));
    expect(contextValue?.features).toEqual([updated]);
  });

  it('deleteFeature calls API and refreshes', async () => {
    const feature = { key: 'login', description: 'desc' };
    globalAny.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [feature] }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // DELETE
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // refresh
    let contextValue: FeatureContextType | undefined;
    await act(async () => {
      render(
        <FeatureProvider>
          <FeatureContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FeatureContext.Consumer>
        </FeatureProvider>
      );
    });
    await act(async () => {
    await contextValue?.deleteFeature('login');
    });
    expect(globalAny.fetch).toHaveBeenCalledWith('http://localhost:8080/api/feature/login', expect.objectContaining({ method: 'DELETE' }));
    expect(contextValue?.features).toEqual([]);
  });

  it('handles fetch errors gracefully', async () => {
    globalAny.fetch.mockResolvedValueOnce({ ok: false });
    let contextValue: FeatureContextType | undefined;
    await act(async () => {
      render(
        <FeatureProvider>
          <FeatureContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FeatureContext.Consumer>
        </FeatureProvider>
      );
    });
    expect(contextValue?.features).toEqual([]);
    expect(contextValue?.loading).toBe(false);
  });
});
