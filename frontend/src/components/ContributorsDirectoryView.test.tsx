import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContributorsDirectoryView from './ContributorsDirectoryView';
import { ContributorProvider } from '../context/ContributorContext';
import { vi } from 'vitest';

// Mock context data
const mockContributors = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
];

const mockMarkdown = {
  alice: '# Alice\n\nAlice profile',
  bob: '# Bob\n\nBob profile',
  charlie: '# Charlie\n\nCharlie profile',
};

vi.mock('../context/ContributorContext', async () => {
  const actual = await vi.importActual<any>('../context/ContributorContext');
  return {
    ...actual,
    useContributors: () => ({
      contributors: mockContributors,
      loading: false,
      error: null,
      getContributorMarkdown: vi.fn((slug: string) => Promise.resolve(mockMarkdown[slug])),
    }),
  };
});

describe('ContributorsDirectoryView', () => {
  function renderWithProvider() {
    return render(
      <ContributorProvider>
        <ContributorsDirectoryView />
      </ContributorProvider>
    );
  }

  it('renders contributor list and selects the first by default', async () => {
    renderWithProvider();
    expect(screen.getByText('Contributors')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    // Wait for markdown to load
    await waitFor(() => expect(screen.getByText('Alice profile')).toBeInTheDocument());
  });

  it('shows markdown for selected contributor', async () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Bob'));
    await waitFor(() => expect(screen.getByText('Bob profile')).toBeInTheDocument());
  });

  it('shows and hides raw markdown when toggled', async () => {
    const { container } = renderWithProvider();
    // Wait for markdown to load
    await waitFor(() => expect(screen.getByText('Alice profile')).toBeInTheDocument());
    const toggle = screen.getByRole('button', { name: /show raw markdown/i });
    fireEvent.click(toggle);
    await waitFor(() => {
      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      expect(pre?.textContent).toContain('# Alice');
      expect(pre?.textContent).toContain('Alice profile');
    });
    // Re-query the toggle button by its new label
    const hideToggle = screen.getByRole('button', { name: /hide raw markdown/i });
    fireEvent.click(hideToggle);
    await waitFor(() => {
      expect(container.querySelector('pre')).not.toBeInTheDocument();
    });
  });

  it('shows loading and error states', async () => {
    vi.resetModules();
    vi.doMock('../context/ContributorContext', () => ({
      useContributors: () => ({
        contributors: [],
        loading: true,
        error: 'Failed to load',
        getContributorMarkdown: vi.fn(),
      }),
    }));
    const { unmount } = renderWithProvider();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    unmount();
    vi.resetModules();
  });
});
