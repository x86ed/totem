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
    // Initial GET returns both components, POST returns ok, second GET returns new list
    global.fetch = vi
      .fn()
      // Initial GET (provider mount)
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => mockComponents }))
      // POST
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      // Second GET (after add)
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
    // Initial GET returns both components, PUT returns ok, second GET returns updated list
    global.fetch = vi
      .fn()
      // Initial GET (provider mount)
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => mockComponents }))
      // PUT
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      // Second GET (after update)
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
    // Initial GET returns both components, DELETE returns ok, second GET returns filtered list
    global.fetch = vi
      .fn()
      // Initial GET (provider mount)
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => mockComponents }))
      // DELETE
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      // Second GET (after delete)
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
      // Debug output to help diagnose test failure
      // eslint-disable-next-line no-console
      console.log('components after delete:', contextValue!.components);
      expect(Array.isArray(contextValue!.components)).toBe(true);
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
