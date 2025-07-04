import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import  BacklogView  from './BacklogView'
import type { Ticket } from '../types'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock the useTickets hook
const mockUseTickets = vi.fn()
vi.mock('../context/TicketContext', () => ({
  useTickets: () => mockUseTickets(),
}))

const mockTickets: Ticket[] = [
  {
    id: 'healthcare.security.auth-sso-001',
    title: 'SSO Authentication for Patient Portal',
    description: 'HIPAA-compliant SAML/OAuth integration with Active Directory.',
    status: 'open',
    priority: 'high',
    complexity: 'medium',
    persona: 'security-sasha',
    blocks: ['healthcare.frontend.patient-dashboard-003'],
    blocked_by: ['healthcare.infrastructure.ad-integration-001']
  },
  {
    id: 'healthcare.frontend.patient-dashboard-003',
    title: 'Patient Dashboard Redesign',
    description: 'Modern React-based dashboard with real-time data visualization.',
    status: 'in-progress',
    priority: 'medium',
    complexity: 'high',
    persona: 'product-proteus',
    blocks: ['healthcare.mobile.app-sync-007'],
    blocked_by: ['healthcare.security.auth-sso-001']
  }
]

describe('BacklogView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: mockTickets,
      milestones: [],
      loading: false,
      error: null,
      refreshTickets: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
    })
  })

  const renderBacklogView = () => {
    return render(<BacklogView />)
  }

  describe('Component Rendering', () => {
    it('renders the backlog view with title', () => {
      renderBacklogView()
      
      expect(screen.getByText('📋 Backlog')).toBeInTheDocument()
      expect(screen.getByText('All tickets in a sortable table view')).toBeInTheDocument()
    })

    it('renders the data table with correct headers', () => {
      renderBacklogView()
      
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Priority')).toBeInTheDocument()
      expect(screen.getByText('Complexity')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Persona')).toBeInTheDocument()
    })

    it('renders ticket data in the table', () => {
      renderBacklogView()
      
      expect(screen.getByText('healthcare.security.auth-sso-001')).toBeInTheDocument()
      expect(screen.getByText('SSO Authentication for Patient Portal')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('security-sasha')).toBeInTheDocument()
    })
  })

  describe('Sorting Functionality', () => {
    it('sorts tickets by ID when ID header is clicked', async () => {
      renderBacklogView()
      
      // Initial state should have healthcare.frontend.patient-dashboard-003 first (ascending order by default)
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const firstDataRow = rows[1] // Skip header row
        expect(firstDataRow.querySelector('td:first-child')).toHaveTextContent('healthcare.frontend.patient-dashboard-003')
      })
      
      // After clicking, should reverse to descending order
      const idHeader = screen.getByText('ID')
      fireEvent.click(idHeader)
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const firstDataRow = rows[1] // Skip header row
        expect(firstDataRow.querySelector('td:first-child')).toHaveTextContent('healthcare.security.auth-sso-001')
      })
    })

    it('sorts tickets by priority when Priority header is clicked', async () => {
      renderBacklogView()
      
      const priorityHeader = screen.getByText('Priority')
      fireEvent.click(priorityHeader)
      
      // Priority should be sorted with high priority first (descending by default)
      await waitFor(() => {
        const priorityElements = screen.getAllByText(/HIGH|MEDIUM/)
        expect(priorityElements[0]).toHaveTextContent('HIGH')
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to edit view when a row is clicked', () => {
      const mockOnNavigateToTicket = vi.fn()
      render(<BacklogView onNavigateToTicket={mockOnNavigateToTicket} />)
      
      const firstRow = screen.getAllByRole('row')[1] // Skip header row
      fireEvent.click(firstRow)
      
      expect(mockOnNavigateToTicket).toHaveBeenCalledWith('edit', 'healthcare.frontend.patient-dashboard-003')
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state when tickets are loading', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        loading: true,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('Loading tickets...')).toBeInTheDocument()
    })

    it('shows error state when there is an error', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        loading: false,
        error: 'Failed to load tickets',
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('Error: Failed to load tickets')).toBeInTheDocument()
    })

    it('shows empty state when no tickets are available', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('No tickets found.')).toBeInTheDocument()
    })
  })

  describe('Table Features', () => {
    it('displays correct status badges', () => {
      renderBacklogView()
      
      expect(screen.getByText('OPEN')).toBeInTheDocument()
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
    })

    it('displays correct priority badges', () => {
      renderBacklogView()
      
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    })

    it('handles missing optional fields gracefully', () => {
      const ticketsWithMissingFields: Ticket[] = [
        {
          id: 'healthcare.minimal.test-001',
          title: 'Minimal Ticket',
          description: 'Description',
          status: 'open',
          priority: 'low',
          complexity: undefined,
          persona: undefined,
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: ticketsWithMissingFields,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('healthcare.minimal.test-001')).toBeInTheDocument()
      expect(screen.getByText('Minimal Ticket')).toBeInTheDocument()
    })
  })
})
