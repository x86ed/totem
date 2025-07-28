import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsView from './SettingsView';

// Mock fetch for PrefixContext
import { vi } from 'vitest';
// Removed unused node-fetch import

beforeEach(() => {
  global.fetch = vi.fn((input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/prefix') && (!init || init.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ prefix: 'TEST' })
      }) as Promise<Response>;
    }
    if (url.includes('/api/prefix') && init && init.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ prefix: JSON.parse(init.body as string).prefix })
      }) as Promise<Response>;
    }
    return Promise.reject('Unknown endpoint');
  }) as unknown as typeof global.fetch;
});


// Layer API mock
const mockLayers = [
  { key: 'Frontend', description: 'User interface, web apps' },
  { key: 'Backend', description: 'Server logic, APIs, DB' }
];

beforeEach(() => {
  global.fetch = vi.fn((input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/prefix') && (!init || init.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ prefix: 'TEST' })
      }) as Promise<Response>;
    }
    if (url.includes('/api/prefix') && init && init.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ prefix: JSON.parse(init.body as string).prefix })
      }) as Promise<Response>;
    }
    if (url.includes('/api/layer')) {
      if (!init || init.method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLayers)
        }) as Promise<Response>;
      }
      if (init && init.method === 'POST') {
        mockLayers.push(JSON.parse(init.body as string));
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }) as Promise<Response>;
      }
      if (init && init.method === 'PUT') {
        const updated = JSON.parse(init.body as string);
        const oldKey = decodeURIComponent(url.split('/').pop() || '');
        const idx = mockLayers.findIndex(l => l.key === oldKey);
        if (idx >= 0) {
          // If newKey is present, update the key
          if (updated.newKey && updated.newKey !== oldKey) {
            mockLayers[idx] = { key: updated.newKey, description: updated.description };
          } else {
            mockLayers[idx] = { key: updated.key, description: updated.description };
          }
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }) as Promise<Response>;
      }
      if (init && init.method === 'DELETE') {
        const key = decodeURIComponent(url.split('/').pop() || '');
        const idx = mockLayers.findIndex(l => l.key === key);
        if (idx >= 0) mockLayers.splice(idx, 1);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }) as Promise<Response>;
      }
    }
    return Promise.reject('Unknown endpoint');
  }) as unknown as typeof global.fetch;
});

afterEach(() => {
  vi.resetAllMocks();
  mockLayers.length = 2;
  mockLayers[0] = { key: 'Frontend', description: 'User interface, web apps' };
  mockLayers[1] = { key: 'Backend', description: 'Server logic, APIs, DB' };
});

describe('SettingsView', () => {
  it('renders LayerTypesSection and displays layers from API', async () => {
    render(<SettingsView />);
    await waitFor(() => {
      expect(screen.getByText('Layer Types')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });
  });

  it('can add a new layer', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByText('Layer Types')).toBeInTheDocument());
    // Find the Layer Types section
    const layerSection = screen.getByText('Layer Types').closest('.settings-section');
    // Find inputs and button scoped to Layer Types section
    const keyInput = layerSection?.querySelector('input[placeholder="Add key..."]') as HTMLInputElement;
    const descInput = layerSection?.querySelector('input[placeholder="Description..."]') as HTMLInputElement;
    const addButton = Array.from(layerSection?.querySelectorAll('button') || []).find(btn => btn.textContent === 'Add');
    // Fill and submit
    fireEvent.change(keyInput, { target: { value: 'Docs' } });
    fireEvent.change(descInput, { target: { value: 'Documentation and guides' } });
    if (addButton) fireEvent.click(addButton);
    await waitFor(() => {
      // Assert new layer appears in Layer Types section
      expect(layerSection?.textContent).toContain('Docs');
      expect(layerSection?.textContent).toContain('Documentation and guides');
    });
  });

  it('can edit a layer', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByText('Frontend')).toBeInTheDocument());
    fireEvent.click(screen.getAllByLabelText(/Edit/)[0]);
    fireEvent.change(screen.getAllByDisplayValue('Frontend')[0], { target: { value: 'FE' } });
    const descInputs = screen.getAllByPlaceholderText('Description...');
    fireEvent.change(descInputs[0], { target: { value: 'UI' } });
    const saveButtons = screen.getAllByText('Save');
    fireEvent.click(saveButtons[0]);
    await waitFor(() => {
      expect(screen.getByDisplayValue('FE')).toBeInTheDocument();
      expect(screen.getByDisplayValue('UI')).toBeInTheDocument();
      expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
    });
  });

  it('can delete a layer', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByText('Backend')).toBeInTheDocument());
    const removeButtons = screen.getAllByLabelText(/Remove/);
    fireEvent.click(removeButtons[1]);
    await waitFor(() => {
      expect(screen.queryByText('Backend')).not.toBeInTheDocument();
    });
  });

  it('shows loading indicator when loading', async () => {
    // Simulate slow fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve([]) }), 100)));
    render(<SettingsView />);
    expect(screen.getAllByText(/Loading.../).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument());
  });
  it('renders Project Prefix input and loads value from API', async () => {
    render(<SettingsView />);
    expect(screen.getByPlaceholderText('e.g. PROJ')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('TEST')).toBeInTheDocument());
  });

  it('enables Save button when prefix is changed', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByDisplayValue('TEST')).toBeInTheDocument());
    const input = screen.getByPlaceholderText('e.g. PROJ');
    fireEvent.change(input, { target: { value: 'NEWPRF' } });
    expect(screen.getByText('Save')).not.toHaveClass('opacity-50');
    expect(screen.getByText('Save')).not.toBeDisabled();
  });

  it('disables Save button when loading or unchanged', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByDisplayValue('TEST')).toBeInTheDocument());
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('saves new prefix and disables Save button after', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByDisplayValue('TEST')).toBeInTheDocument());
    const input = screen.getByPlaceholderText('e.g. PROJ');
    fireEvent.change(input, { target: { value: 'NEWPRF' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByDisplayValue('NEWPRF')).toBeInTheDocument());
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('shows correct ticket ID preview', async () => {
    render(<SettingsView />);
    await waitFor(() => expect(screen.getByDisplayValue('TEST')).toBeInTheDocument());
    expect(screen.getByText(/Prefix used for ticket IDs/)).toHaveTextContent('TEST-123');
  });
});
