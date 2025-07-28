// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestInit = any;
import { render, waitFor, act } from '@testing-library/react';
import { PriorityContext, PriorityProvider } from './PriorityContext';





const prioritiesMock = [
  { key: 'critical', description: 'Immediate action required' },
  { key: 'high', description: 'Important and urgent' }
];
let priorities = [...prioritiesMock];

type Priority = { key: string; description: string };
type FetchResponse = { ok: boolean; json: Priority[] | Priority | object; status?: number; statusText?: string };
function makeResponse(obj: FetchResponse): Response {
  return {
    ok: obj.ok,
    json: () => Promise.resolve(obj.json),
    status: obj.status || (obj.ok ? 200 : 400),
    statusText: obj.statusText || '',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => makeResponse(obj),
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => '',
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal('fetch', (url: string, options?: RequestInit) => {
    if (typeof url === 'string' && url.endsWith('/api/priority') && (!options || options.method === 'GET')) {
      return Promise.resolve(makeResponse({ ok: true, json: priorities }));
    }
    if (typeof url === 'string' && url.endsWith('/api/priority') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      priorities.push(body);
      return Promise.resolve(makeResponse({ ok: true, json: body }));
    }
    if (typeof url === 'string' && url.includes('/api/priority/') && options?.method === 'PUT') {
      const key = decodeURIComponent(url.split('/').pop()!);
      const body = JSON.parse(options.body as string);
      const idx = priorities.findIndex((p: Priority) => p.key === key);
      if (idx !== -1) {
        priorities[idx] = { key: body.newKey || key, description: body.description };
        return Promise.resolve(makeResponse({ ok: true, json: priorities[idx] }));
      }
      return Promise.resolve(makeResponse({ ok: false, json: {} }));
    }
    if (typeof url === 'string' && url.includes('/api/priority/') && options?.method === 'DELETE') {
      const key = decodeURIComponent(url.split('/').pop()!);
      priorities = priorities.filter((p: Priority) => p.key !== key);
      return Promise.resolve(makeResponse({ ok: true, json: {} }));
    }
    return Promise.resolve(makeResponse({ ok: false, json: {} }));
  });
});

describe('PriorityContext', () => {
  beforeEach(() => {
    priorities = [...prioritiesMock];
  });

  it('updates priority key and description with newKey', async () => {
    let contextValue:
      | {
          priorities: Priority[];
          updatePriority: (key: string, item: Priority) => Promise<void>;
        }
      | undefined;
    render(
      <PriorityProvider>
        <PriorityContext.Consumer>
          {(value: typeof contextValue) => {
            contextValue = value;
            return null;
          }}
        </PriorityContext.Consumer>
      </PriorityProvider>
    );
    await waitFor(() => expect(contextValue).toBeDefined());
    // Update key and description
    await act(async () => {
      if (contextValue) {
        await contextValue.updatePriority('critical', { key: 'urgent', description: 'Changed desc' });
      }
    });
    await waitFor(() => {
      expect(contextValue!.priorities.some((p: Priority) => p.key === 'urgent' && p.description === 'Changed desc')).toBe(true);
      expect(contextValue!.priorities.some((p: Priority) => p.key === 'critical')).toBe(false);
    });
  });
});
