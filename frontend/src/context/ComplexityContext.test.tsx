// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestInit = any;
import { render, waitFor, act } from '@testing-library/react';
import { ComplexityContext, ComplexityProvider } from './ComplexityContext';

const complexitiesMock = [
  { key: 'low', description: 'Minimal effort required' },
  { key: 'medium', description: 'Moderate effort required' }
];
let complexities = [...complexitiesMock];

type ComplexityItem = { key: string; description: string };
type FetchResponse = { ok: boolean; json: ComplexityItem[] | ComplexityItem | object; status?: number; statusText?: string };
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
    if (typeof url === 'string' && url.endsWith('/api/complexity') && (!options || options.method === 'GET')) {
      return Promise.resolve(makeResponse({ ok: true, json: complexities }));
    }
    if (typeof url === 'string' && url.endsWith('/api/complexity') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      complexities.push(body);
      return Promise.resolve(makeResponse({ ok: true, json: body }));
    }
    if (typeof url === 'string' && url.includes('/api/complexity/') && options?.method === 'PUT') {
      const key = decodeURIComponent(url.split('/').pop()!);
      const body = JSON.parse(options.body as string);
      const idx = complexities.findIndex((c: ComplexityItem) => c.key === key);
      if (idx !== -1) {
        complexities[idx] = { key: body.newKey || key, description: body.description };
        return Promise.resolve(makeResponse({ ok: true, json: complexities[idx] }));
      }
      return Promise.resolve(makeResponse({ ok: false, json: {} }));
    }
    if (typeof url === 'string' && url.includes('/api/complexity/') && options?.method === 'DELETE') {
      const key = decodeURIComponent(url.split('/').pop()!);
      complexities = complexities.filter((c: ComplexityItem) => c.key !== key);
      return Promise.resolve(makeResponse({ ok: true, json: {} }));
    }
    return Promise.resolve(makeResponse({ ok: false, json: {} }));
  });
});

describe('ComplexityContext', () => {
  beforeEach(() => {
    complexities = [...complexitiesMock];
  });

  it('updates complexity key and description with newKey', async () => {
    let contextValue:
      | {
          complexities: ComplexityItem[];
          updateComplexity: (key: string, item: ComplexityItem) => Promise<void>;
        }
      | undefined;
    render(
      <ComplexityProvider>
        <ComplexityContext.Consumer>
          {(value: typeof contextValue) => {
            contextValue = value;
            return null;
          }}
        </ComplexityContext.Consumer>
      </ComplexityProvider>
    );
    await waitFor(() => expect(contextValue).toBeDefined());
    // Update key and description
    await act(async () => {
      if (contextValue) {
        await contextValue.updateComplexity('low', { key: 'simple', description: 'Changed desc' });
      }
    });
    await waitFor(() => {
      expect(contextValue!.complexities.some((c: ComplexityItem) => c.key === 'simple' && c.description === 'Changed desc')).toBe(true);
      expect(contextValue!.complexities.some((c: ComplexityItem) => c.key === 'low')).toBe(false);
    });
  });
});
