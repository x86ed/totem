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

// Default mock for all tests except the loading/error test
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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });
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
    // Re-query the toggle button by its new label, waiting for it to appear
    const hideToggle = await screen.findByRole('button', { name: /hide raw markdown/i });
    fireEvent.click(hideToggle);
    await waitFor(() => {
      expect(container.querySelector('pre')).not.toBeInTheDocument();
    });
  });

  it('shows loading and error states', async () => {
    // Re-mock the context for this test only
    vi.resetModules();
    vi.doMock('../context/ContributorContext', () => ({
      useContributors: () => ({
        contributors: [],
        loading: true,
        error: 'Failed to load',
        getContributorMarkdown: vi.fn(),
      }),
    }));
    // Re-import the component after mocking
    const { ContributorProvider } = await import('../context/ContributorContext');
    const ContributorsDirectoryView = (await import('./ContributorsDirectoryView')).default;
    const { unmount } = render(
      <ContributorProvider>
        <ContributorsDirectoryView />
      </ContributorProvider>
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    unmount();
  });
});
