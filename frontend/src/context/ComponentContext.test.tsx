import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ComponentProvider, ComponentContext, ComponentItem } from './ComponentContext';

const mockComponents: ComponentItem[] = [
  { key: 'auth', description: 'Authentication and authorization systems' },
  { key: 'user', description: 'User management, profiles, accounts' }
];

const mockFetch = (data: ComponentItem[], ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    json: async () => data
  });

describe('ComponentContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default GET returns mockComponents
    global.fetch = mockFetch(mockComponents);
  });

  it('provides initial components from API', async () => {
    let contextValue: import('./ComponentContext').ComponentContextType | undefined;
    render(
      <ComponentProvider>
        <ComponentContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ComponentContext.Consumer>
      </ComponentProvider>
    );
    await waitFor(() => {
      expect(contextValue!.components.length).toBe(2);
      expect(contextValue!.components[0].key).toBe('auth');
    });
  });

  it('addComponent calls API and refreshes', async () => {
    // POST returns ok, then GET returns new list
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => [...mockComponents, { key: 'new', description: 'desc' }] }));
    let contextValue: import('./ComponentContext').ComponentContextType | undefined;
    render(
      <ComponentProvider>
        <ComponentContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ComponentContext.Consumer>
      </ComponentProvider>
    );
    await act(async () => {
      await contextValue!.addComponent({ key: 'new', description: 'desc' });
    });
    await waitFor(() => {
      expect(contextValue!.components.some((c: ComponentItem) => c.key === 'new')).toBe(true);
    });
  });

  it('updateComponent calls API and refreshes', async () => {
    // PUT returns ok, then GET returns updated list
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => [{ key: 'auth', description: 'updated' }, mockComponents[1]] }));
    let contextValue: import('./ComponentContext').ComponentContextType | undefined;
    render(
      <ComponentProvider>
        <ComponentContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ComponentContext.Consumer>
      </ComponentProvider>
    );
    await act(async () => {
      await contextValue!.updateComponent('auth', { key: 'auth', description: 'updated' });
    });
    await waitFor(() => {
      expect(contextValue!.components.find((c: ComponentItem) => c.key === 'auth')?.description).toBe('updated');
    });
  });

  it('deleteComponent calls API and refreshes', async () => {
    // DELETE returns ok, then GET returns filtered list
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => [mockComponents[1]] }));
    let contextValue: import('./ComponentContext').ComponentContextType | undefined;
    render(
      <ComponentProvider>
        <ComponentContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ComponentContext.Consumer>
      </ComponentProvider>
    );
    await act(async () => {
      await contextValue!.deleteComponent('auth');
    });
    await waitFor(() => {
      expect(contextValue!.components.length).toBe(1);
      expect(contextValue!.components[0].key).toBe('user');
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    let contextValue: import('./ComponentContext').ComponentContextType | undefined;
    render(
      <ComponentProvider>
        <ComponentContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </ComponentContext.Consumer>
      </ComponentProvider>
    );
    await waitFor(() => {
      expect(contextValue!.components.length).toBe(0);
      expect(contextValue!.loading).toBe(false);
    });
  });
});
