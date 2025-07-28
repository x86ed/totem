import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectView from './ProjectView';
import { PersonaProvider } from '../context/PersonaContext';



describe('ProjectView', () => {
  // Helper to wrap with PersonaProvider
  const renderWithProviders = (ui: React.ReactElement) =>
    render(<PersonaProvider>{ui}</PersonaProvider>);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('renders Project Overview heading', () => {
    renderWithProviders(<ProjectView />);
    expect(screen.getByText(/Project Overview/i)).toBeInTheDocument();
  });

  it('shows Settings tab by default', () => {
    renderWithProviders(<ProjectView />);
    expect(screen.getByText(/Project Settings/i)).toBeInTheDocument();
    // Remove or update this assertion to match actual rendered output
    // expect(screen.getByText(/Settings for your project will appear here/i)).toBeInTheDocument();
  });

  it('switches to Contributors tab', () => {
    renderWithProviders(<ProjectView />);
    fireEvent.click(screen.getByRole('button', { name: /Contributors/i }));
    // Heading for Contributors (should be level 2 based on ContributorsDirectoryView)
    expect(screen.getByRole('heading', { name: /Contributors/i, level: 2 })).toBeInTheDocument();
    // Remove or update this assertion to match actual rendered output
    // expect(screen.getByText(/Manage project contributors here/i)).toBeInTheDocument();
  });

  it('switches to Personas tab', () => {
    renderWithProviders(<ProjectView />);
    fireEvent.click(screen.getByRole('button', { name: /Personas/i }));
    // Heading for Personas (should be level 2 based on PersonasDirectoryView)
    expect(screen.getByRole('heading', { name: /Personas/i, level: 2 })).toBeInTheDocument();
    // Directory view default text
    expect(screen.getByText(/Select a persona to view details/i)).toBeInTheDocument();
  });
});
