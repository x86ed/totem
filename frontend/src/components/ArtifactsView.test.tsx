
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// ...existing code...
import React from 'react';
import ArtifactsView from './ArtifactsView';
import { ArtifactsProvider } from '../context/ArtifactsContext';

describe('ArtifactsView', () => {
  const renderWithProvider = (ui: React.ReactElement) =>
    render(<ArtifactsProvider>{ui}</ArtifactsProvider>);

  it('renders Artifacts heading', async () => {
    renderWithProvider(<ArtifactsView />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Artifacts/i })).toBeInTheDocument())
  })

  it('shows placeholder text', async () => {
    renderWithProvider(<ArtifactsView />)
    await waitFor(() => expect(screen.getByText(/Select a file to view its contents\./i)).toBeInTheDocument())
  })
})
