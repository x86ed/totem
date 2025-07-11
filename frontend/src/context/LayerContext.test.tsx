
import { vi } from 'vitest';
import { Mock } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { LayerProvider, LayerContext, type LayerContextType, type LayerItem } from './LayerContext';

const mockLayers: LayerItem[] = [
  { key: 'Frontend', description: 'User interface' },
  { key: 'Backend', description: 'Server logic' }
];

global.fetch = vi.fn();

describe('LayerContext', () => {
  beforeEach(() => {
    (global.fetch as Mock).mockReset();
  });

  it('fetches layers on mount', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLayers
    });
    let contextValue: LayerContextType | undefined;
    render(
      <LayerProvider>
        <LayerContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </LayerContext.Consumer>
      </LayerProvider>
    );
    await waitFor(() => expect(contextValue?.loading).toBe(false));
    expect(contextValue?.layers).toEqual(mockLayers);
  });

  it('addLayer calls POST and refreshes', async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockLayers }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // POST
      .mockResolvedValueOnce({ ok: true, json: async () => [...mockLayers, { key: 'GraphQL', description: 'API' }] }); // refresh
    let contextValue: LayerContextType | undefined;
    render(
      <LayerProvider>
        <LayerContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </LayerContext.Consumer>
      </LayerProvider>
    );
    await waitFor(() => expect(contextValue?.loading).toBe(false));
    await act(async () => {
      await contextValue?.addLayer({ key: 'GraphQL', description: 'API' });
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/layer', expect.objectContaining({ method: 'POST' }));
    expect(contextValue?.layers).toEqual([...mockLayers, { key: 'GraphQL', description: 'API' }]);
  });

  it('updateLayer calls PUT and refreshes', async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockLayers }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // PUT
      .mockResolvedValueOnce({ ok: true, json: async () => [{ key: 'Frontend', description: 'Updated' }, mockLayers[1]] }); // refresh
    let contextValue: LayerContextType | undefined;
    render(
      <LayerProvider>
        <LayerContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </LayerContext.Consumer>
      </LayerProvider>
    );
    await waitFor(() => expect(contextValue?.loading).toBe(false));
    await act(async () => {
      await contextValue?.updateLayer('Frontend', { key: 'Frontend', description: 'Updated' });
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/layer/Frontend', expect.objectContaining({ method: 'PUT' }));
    expect(contextValue?.layers?.[0].description).toBe('Updated');
  });

  it('deleteLayer calls DELETE and refreshes', async () => {
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockLayers }) // initial fetch
      .mockResolvedValueOnce({ ok: true }) // DELETE
      .mockResolvedValueOnce({ ok: true, json: async () => [mockLayers[1]] }); // refresh
    let contextValue: LayerContextType | undefined;
    render(
      <LayerProvider>
        <LayerContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </LayerContext.Consumer>
      </LayerProvider>
    );
    await waitFor(() => expect(contextValue?.loading).toBe(false));
    await act(async () => {
      await contextValue?.deleteLayer('Frontend');
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/layer/Frontend', expect.objectContaining({ method: 'DELETE' }));
    expect(contextValue?.layers).toEqual([mockLayers[1]]);
  });
});
