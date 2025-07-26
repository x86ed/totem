// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestInit = any;
import { render, waitFor, act } from '@testing-library/react';
import { StatusContext, StatusProvider } from './StatusContext';

const statusesMock = [
  { key: 'planned', description: 'Still gathering requirements' },
  { key: 'open', description: 'Ready for work' }
];
let statuses = [...statusesMock];

type StatusItem = { key: string; description: string };
type FetchResponse = { ok: boolean; json: StatusItem[] | StatusItem | object; status?: number; statusText?: string };
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
    if (typeof url === 'string' && url.endsWith('/api/status') && (!options || options.method === 'GET')) {
      return Promise.resolve(makeResponse({ ok: true, json: statuses }));
    }
    if (typeof url === 'string' && url.endsWith('/api/status') && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      statuses.push(body);
      return Promise.resolve(makeResponse({ ok: true, json: body }));
    }
    if (typeof url === 'string' && url.includes('/api/status/') && options?.method === 'PUT') {
      const key = decodeURIComponent(url.split('/').pop()!);
      const body = JSON.parse(options.body as string);
      const idx = statuses.findIndex((s: StatusItem) => s.key === key);
      if (idx !== -1) {
        statuses[idx] = { key: body.newKey || key, description: body.description };
        return Promise.resolve(makeResponse({ ok: true, json: statuses[idx] }));
      }
      return Promise.resolve(makeResponse({ ok: false, json: {} }));
    }
    if (typeof url === 'string' && url.includes('/api/status/') && options?.method === 'DELETE') {
      const key = decodeURIComponent(url.split('/').pop()!);
      statuses = statuses.filter((s: StatusItem) => s.key !== key);
      return Promise.resolve(makeResponse({ ok: true, json: {} }));
    }
    return Promise.resolve(makeResponse({ ok: false, json: {} }));
  });
});

describe('StatusContext', () => {
  beforeEach(() => {
    statuses = [...statusesMock];
  });

  it('updates status key and description with newKey', async () => {
    let contextValue:
      | {
          statuses: StatusItem[];
          updateStatus: (key: string, item: StatusItem) => Promise<void>;
        }
      | undefined;
    render(
      <StatusProvider>
        <StatusContext.Consumer>
          {(value: typeof contextValue) => {
            contextValue = value;
            return null;
          }}
        </StatusContext.Consumer>
      </StatusProvider>
    );
    await waitFor(() => expect(contextValue).toBeDefined());
    // Update key and description
    await act(async () => {
      if (contextValue) {
        await contextValue.updateStatus('planned', { key: 'inprogress', description: 'Work started' });
      }
    });
    await waitFor(() => {
      expect(contextValue!.statuses.some((s: StatusItem) => s.key === 'inprogress' && s.description === 'Work started')).toBe(true);
      expect(contextValue!.statuses.some((s: StatusItem) => s.key === 'planned')).toBe(false);
    });
  });
});
