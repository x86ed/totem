/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateTicket from './CreateTicket'

// Mock all context providers and hooks
// Do not mock PrefixContext or usePrefix so the real provider is used
vi.mock('../context/LayerContext', () => ({
  LayerContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { layers: { key: string }[]; loading: boolean }) => React.ReactNode }) => children({ layers: [{ key: 'layer1' }], loading: false })
  }
}))
vi.mock('../context/ComponentContext', () => ({
  ComponentContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { components: { key: string }[]; loading: boolean }) => React.ReactNode }) => children({ components: [{ key: 'component1' }], loading: false })
  }
}))
vi.mock('../context/FeatureContext', () => ({
  FeatureContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { features: { key: string }[]; loading: boolean }) => React.ReactNode }) => children({ features: [{ key: 'feature1' }], loading: false })
  }
}))
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn(() => ({
    tickets: [],
    addTicket: vi.fn(),
    updateTicket: vi.fn(),
    milestones: [],
  }))
}))
vi.mock('../context/StatusContext', () => ({
  StatusContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { statuses: { key: string; description: string }[]; loading: boolean }) => React.ReactNode }) => children({ statuses: [{ key: 'open', description: 'Open' }], loading: false })
  }
}))
vi.mock('../context/PriorityContext', () => ({
  PriorityContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { priorities: { key: string; description: string }[]; loading: boolean }) => React.ReactNode }) => children({ priorities: [{ key: 'medium', description: 'Medium' }, { key: 'high', description: 'High' }], loading: false })
  }
}))
vi.mock('../context/ComplexityContext', () => ({
  ComplexityContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: { complexities: { key: string; description: string }[]; loading: boolean }) => React.ReactNode }) => children({ complexities: [{ key: 'medium', description: 'Medium' }, { key: 'high', description: 'High' }], loading: false })
  }
}))
vi.mock('../context/PersonaContext', () => ({
  PersonaProvider: ({ children }: { children: React.ReactNode }) => children,
  usePersonas: () => ({ personas: [], loading: false })
}))
vi.mock('../context/ContributorContext', () => ({
  ContributorProvider: ({ children }: { children: React.ReactNode }) => children,
  useContributors: () => ({ contributors: [], loading: false })
}))
vi.mock('boring-avatars', async () => {
  return {
    __esModule: true,
    default: () => <span data-testid="avatar">Avatar</span>,
    Avatar: () => <span data-testid="avatar">Avatar</span>
  };
});
vi.mock('./MilkdownEditor', () => ({
  MilkdownEditor: (props: { id: string, value: string, onChange: (v: string) => void, 'aria-label'?: string, 'aria-labelledby'?: string, placeholder?: string, minHeight?: string, className?: string }) => (
    <textarea
      id={props.id}
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      aria-label={props['aria-label'] || ''}
      aria-labelledby={props['aria-labelledby'] || ''}
      placeholder={props.placeholder}
      style={{ minHeight: props.minHeight || '100px', width: '100%' }}
      className={props.className}
    />
  )
}))

// Mock global fetch
beforeAll(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, message: 'Ticket created successfully' })
  })
})

// Basic rendering and interaction tests


import { PrefixProvider } from '../context/PrefixContext'
import { PersonaProvider } from '../context/PersonaContext'
import { ContributorProvider } from '../context/ContributorContext'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrefixProvider>
      <PersonaProvider>
        <ContributorProvider>
          {children}
        </ContributorProvider>
      </PersonaProvider>
    </PrefixProvider>
  )
}

describe('CreateTicket', () => {
  it('renders the form with all required fields', () => {
    render(
      <AllProviders>
        <CreateTicket />
      </AllProviders>
    )
    expect(screen.getByPlaceholderText('Enter ticket title')).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Priority/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Complexity/)).toBeInTheDocument()
  })

  it('updates form fields when user types', async () => {
    const user = userEvent.setup()
    render(
      <AllProviders>
        <CreateTicket />
      </AllProviders>
    )
    const titleInput = screen.getByPlaceholderText('Enter ticket title')
    await user.type(titleInput, 'Test Ticket')
    expect(titleInput).toHaveValue('Test Ticket')
  })

  it('submits the form and shows success message', async () => {
    const user = userEvent.setup()
    render(
      <AllProviders>
        <CreateTicket />
      </AllProviders>
    )
    await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Test Ticket')
    await user.click(screen.getByRole('button', { name: /Create Ticket/ }))
    await waitFor(() => {
      expect(screen.getByText(/Ticket created successfully/)).toBeInTheDocument()
    })
  })

  it('resets the form when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AllProviders>
        <CreateTicket />
      </AllProviders>
    )
    const titleInput = screen.getByPlaceholderText('Enter ticket title')
    await user.type(titleInput, 'Test Ticket')
    await user.click(screen.getByRole('button', { name: /Reset Form/ }))
    expect(titleInput).toHaveValue('')
  })
})
