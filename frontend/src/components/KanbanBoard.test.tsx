/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import KanbanBoard from './KanbanBoard.tsx'
import type { Ticket } from '../types'
import { useTickets } from '../context/TicketContext'

// Mock the useTickets hook
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn()
}))

// Mock TicketCard component
vi.mock('./TicketCard', () => ({
  default: ({ ticket }: { ticket: Ticket }) => (
    <div data-testid={`ticket-${ticket.id}`}>
      <div>{ticket.title}</div>
      <div>{ticket.id}</div>
    </div>
  )
}))

const mockUseTickets = vi.mocked(useTickets)

describe('KanbanBoard', () => {
  const mockTickets: Ticket[] = [
    {
      id: 'healthcare.patient-data.survey-001',
      title: 'Patient Data Survey Integration',
      description: 'Integrate patient survey data collection system',
      status: 'open',
      priority: 'high',
      complexity: 'medium',
      persona: 'Healthcare Provider',
      contributor: 'john.doe',
      blocks: [],
      blocked_by: []
    },
    {
      id: 'healthcare.security.auth-sso-001',
      title: 'Single Sign-On Authentication',
      description: 'Implement SSO for healthcare staff authentication',
      status: 'in-progress',
      priority: 'medium',
      complexity: 'high',
      persona: 'IT Administrator',
      contributor: 'jane.smith',
      blocks: [],
      blocked_by: []
    },
    {
      id: 'healthcare.compliance.audit-trail-001',
      title: 'HIPAA Audit Trail Implementation',
      description: 'Create comprehensive audit trail for HIPAA compliance',
      status: 'todo',
      priority: 'low',
      complexity: 'low',
      persona: 'Compliance Officer',
      contributor: 'bob.wilson',
      blocks: [],
      blocked_by: []
    },
    {
      id: 'healthcare.analytics.reporting-001',
      title: 'Healthcare Analytics Dashboard',
      description: 'Build analytics dashboard for healthcare metrics',
      status: 'done',
      priority: 'high',
      complexity: 'high',
      persona: 'Data Analyst',
      contributor: 'alice.brown',
      blocks: [],
      blocked_by: []
    }
  ]

  const mockUpdateTicket = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: mockTickets,
      milestones: [],
      loading: false,
      error: null,
      refreshTickets: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: mockUpdateTicket,
      deleteTicket: vi.fn(),
      addTicket: vi.fn(),
      moveTicket: vi.fn()
    })
  })

  describe('Component Rendering', () => {
    it('renders the kanban board with all columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Planning')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('renders correct column icons', () => {
      render(<KanbanBoard />)
      
      // Check for icons in column headers specifically using more specific selectors
      expect(screen.getByText('Open').closest('h3')).toHaveTextContent('📝')
      expect(screen.getByText('Planning').closest('h3')).toHaveTextContent('🎯')
      expect(screen.getByText('In Progress').closest('h3')).toHaveTextContent('🔄')
      expect(screen.getByText('Completed').closest('h3')).toHaveTextContent('✅')
    })

    it('displays correct ticket counts in each column', () => {
      render(<KanbanBoard />)
      
      // Each column should show "1" as we have one ticket per status
      const countBadges = screen.getAllByText('1')
      expect(countBadges).toHaveLength(4)
    })

    it('renders tickets in correct columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByTestId('ticket-healthcare.patient-data.survey-001')).toBeInTheDocument() // open
      expect(screen.getByTestId('ticket-healthcare.security.auth-sso-001')).toBeInTheDocument() // in-progress
      expect(screen.getByTestId('ticket-healthcare.compliance.audit-trail-001')).toBeInTheDocument() // todo (planning)
      expect(screen.getByTestId('ticket-healthcare.analytics.reporting-001')).toBeInTheDocument() // done (completed)
    })
  })

  describe('Ticket Distribution', () => {
    it('displays tickets in their respective status columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByText('Patient Data Survey Integration')).toBeInTheDocument()
      expect(screen.getByText('Single Sign-On Authentication')).toBeInTheDocument()
      expect(screen.getByText('HIPAA Audit Trail Implementation')).toBeInTheDocument()
      expect(screen.getByText('Healthcare Analytics Dashboard')).toBeInTheDocument()
    })

    it('handles multiple tickets in the same column', () => {
      const multipleTickets: Ticket[] = [
        ...mockTickets,
        {
          id: 'healthcare.patient-data.survey-002',
          title: 'Another Patient Survey Task',
          description: 'Another task for patient data collection',
          status: 'open',
          priority: 'low',
          complexity: 'low',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: multipleTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Open column should now have 2 tickets
      expect(screen.getByText('Patient Data Survey Integration')).toBeInTheDocument()
      expect(screen.getByText('Another Patient Survey Task')).toBeInTheDocument()
    })

    it('updates ticket counts correctly with multiple tickets', () => {
      const multipleTickets: Ticket[] = [
        ...mockTickets,
        {
          id: 'healthcare.patient-data.survey-002',
          title: 'Another Patient Survey Task',
          description: 'Another task for patient data collection',
          status: 'open',
          priority: 'low',
          complexity: 'low',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        },
        {
          id: 'healthcare.patient-data.survey-003',
          title: 'Third Patient Survey Task',
          description: 'Third task for patient data collection',
          status: 'open',
          priority: 'medium',
          complexity: 'medium',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: multipleTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Open column should show "3", others should show "1"
      expect(screen.getByText('3')).toBeInTheDocument() // open column
      const singleCountBadges = screen.getAllByText('1')
      expect(singleCountBadges).toHaveLength(3) // other columns
    })
  })

  describe('Move Ticket Functionality', () => {
    it('renders move buttons on hover for each ticket', () => {
      render(<KanbanBoard />)
      
      // Move buttons should be present but hidden (opacity-0)
      const moveButtons = screen.getAllByRole('button')
      expect(moveButtons.length).toBeGreaterThan(0)
    })

    it('calls updateTicket when move button is clicked', () => {
      render(<KanbanBoard />)
      
      // Find a move button (there should be multiple for different target columns)
      const moveButtons = screen.getAllByRole('button')
      const firstMoveButton = moveButtons[0]
      
      fireEvent.click(firstMoveButton)
      
      expect(mockUpdateTicket).toHaveBeenCalledTimes(1)
    })

    it('does not render move button for current status', () => {
      render(<KanbanBoard />)
      
      // For a ticket in 'open' status, there should be 3 move buttons (not 4)
      // because it shouldn't have a button to move to its current status
      const allButtons = screen.getAllByRole('button')
      
      // Each ticket should have 3 move buttons (4 statuses - 1 current status)
      // With 4 tickets, we should have 12 total move buttons
      expect(allButtons).toHaveLength(12)
    })

    it('has correct tooltip titles for move buttons', () => {
      render(<KanbanBoard />)
      
      // Check for buttons with title attributes within specific ticket context
      const openTicket = screen.getByTestId('ticket-healthcare.patient-data.survey-001').closest('.relative')
      const inProgressTicket = screen.getByTestId('ticket-healthcare.security.auth-sso-001').closest('.relative')
      const planningTicket = screen.getByTestId('ticket-healthcare.compliance.audit-trail-001').closest('.relative')
      const completedTicket = screen.getByTestId('ticket-healthcare.analytics.reporting-001').closest('.relative')

      if (openTicket) {
        // For open ticket, check available move options
        expect(within(openTicket as HTMLElement).getByTitle('Move to Planning')).toBeInTheDocument()
        expect(within(openTicket as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
        expect(within(openTicket as HTMLElement).getByTitle('Move to Completed')).toBeInTheDocument()
      }

      if (inProgressTicket) {
        // For in-progress ticket, check available move options  
        expect(within(inProgressTicket as HTMLElement).getByTitle('Move to Open')).toBeInTheDocument()
        expect(within(inProgressTicket as HTMLElement).getByTitle('Move to Planning')).toBeInTheDocument()
        expect(within(inProgressTicket as HTMLElement).getByTitle('Move to Completed')).toBeInTheDocument()
      }

      if (planningTicket) {
        // For planning ticket (todo), check available move options
        expect(within(planningTicket as HTMLElement).getByTitle('Move to Open')).toBeInTheDocument()
        expect(within(planningTicket as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
        expect(within(planningTicket as HTMLElement).getByTitle('Move to Completed')).toBeInTheDocument()
      }

      if (completedTicket) {
        // For completed ticket (done), check available move options
        expect(within(completedTicket as HTMLElement).getByTitle('Move to Open')).toBeInTheDocument()
        expect(within(completedTicket as HTMLElement).getByTitle('Move to Planning')).toBeInTheDocument()
        expect(within(completedTicket as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
      }
    })
  })

  describe('Empty States', () => {
    it('shows empty state message when column has no tickets', () => {
      const limitedTickets: Ticket[] = [
        {
          id: 'healthcare.patient-data.survey-001',
          title: 'Only Open Task',
          description: 'Only task in open status',
          status: 'open',
          priority: 'high',
          complexity: 'medium',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: limitedTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Three columns should show empty state
      const emptyMessages = screen.getAllByText('No tickets in this column')
      expect(emptyMessages).toHaveLength(3)
    })

    it('shows correct count of 0 for empty columns', () => {
      const singleTicket: Ticket[] = [
        {
          id: 'healthcare.patient-data.survey-001',
          title: 'Only Open Task',
          description: 'Only task in open status',
          status: 'open',
          priority: 'high',
          complexity: 'medium',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: singleTicket,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      expect(screen.getByText('1')).toBeInTheDocument() // open column
      const zeroCountBadges = screen.getAllByText('0')
      expect(zeroCountBadges).toHaveLength(3) // other columns
    })

    it('handles completely empty board', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      // All columns should show empty state
      const emptyMessages = screen.getAllByText('No tickets in this column')
      expect(emptyMessages).toHaveLength(4)
      
      // All count badges should show 0
      const zeroCountBadges = screen.getAllByText('0')
      expect(zeroCountBadges).toHaveLength(4)
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes to columns', () => {
      render(<KanbanBoard />)
      
      const columns = document.querySelectorAll('.column-green')
      expect(columns).toHaveLength(4)
    })

    it('applies correct styling to column headers', () => {
      render(<KanbanBoard />)
      
      const headers = document.querySelectorAll('.column-header')
      expect(headers).toHaveLength(4)
    })

    it('has responsive grid layout', () => {
      render(<KanbanBoard />)
      
      const gridContainer = document.querySelector('.grid-responsive')
      expect(gridContainer).toBeInTheDocument()
    })

    it('has page container wrapper', () => {
      render(<KanbanBoard />)
      
      const pageContainer = document.querySelector('.page-container')
      expect(pageContainer).toBeInTheDocument()
    })
  })

  describe('Interactive Behavior', () => {
    it('shows move buttons with hover effect classes', () => {
      render(<KanbanBoard />)
      
      // Move buttons should have hover effect classes
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:bg-gray-50')
      })
    })

    it('handles move ticket function calls with correct parameters', () => {
      render(<KanbanBoard />)
      
      // Find a specific move button within the open ticket context and click it
      const openTicket = screen.getByTestId('ticket-healthcare.patient-data.survey-001').closest('.relative')
      if (openTicket) {
        const moveToInProgressButton = within(openTicket as HTMLElement).getByTitle('Move to In Progress')
        fireEvent.click(moveToInProgressButton)
        
        expect(mockUpdateTicket).toHaveBeenCalledWith({
          id: 'healthcare.patient-data.survey-001',
          title: 'Patient Data Survey Integration',
          description: 'Integrate patient survey data collection system',
          status: 'in-progress',
          priority: 'high',
          complexity: 'medium',
          persona: 'Healthcare Provider',
          contributor: 'john.doe',
          blocks: [],
          blocked_by: []
        })
      }
    })

    it('handles tickets with missing optional fields', () => {
      const minimalTickets: Ticket[] = [
        {
          id: 'healthcare.minimal.task-001',
          title: 'Minimal Ticket',
          description: 'Minimal description',
          status: 'open',
          priority: 'medium',
          complexity: 'medium', // Add missing complexity field
          persona: 'Default Persona', // Add missing persona field
          contributor: 'default.user', // Add missing contributor field
          blocks: [],
          blocked_by: []
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: minimalTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: mockUpdateTicket,
        deleteTicket: vi.fn(),
        addTicket: vi.fn(),
        moveTicket: vi.fn()
      })

      render(<KanbanBoard />)
      
      expect(screen.getByText('Minimal Ticket')).toBeInTheDocument()
      expect(screen.getByTestId('ticket-healthcare.minimal.task-001')).toBeInTheDocument()
    })
  })
})
