
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArtifactsView from './ArtifactsView';

describe('ArtifactsView', () => {
  it('renders Artifacts heading', () => {
    render(<ArtifactsView />)
    expect(screen.getByRole('heading', { name: /Artifacts/i })).toBeInTheDocument()
  })

  it('shows placeholder text', () => {
    render(<ArtifactsView />)
    expect(screen.getByText(/Artifact management features coming soon/i)).toBeInTheDocument()
  })
})
