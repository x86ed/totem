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
      id: 'TKT-001',
      title: 'Todo Task',
      description: 'A task in todo status',
      status: 'todo',
      priority: 'high',
      assignee: 'john.doe',
      milestone: 'v1.0',
      created: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'TKT-002',
      title: 'In Progress Task',
      description: 'A task in progress',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'jane.smith',
      milestone: 'v1.0',
      created: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 'TKT-003',
      title: 'Review Task',
      description: 'A task in review',
      status: 'review',
      priority: 'low',
      assignee: 'bob.wilson',
      milestone: 'v1.1',
      created: '2024-01-03T00:00:00.000Z'
    },
    {
      id: 'TKT-004',
      title: 'Done Task',
      description: 'A completed task',
      status: 'done',
      priority: 'high',
      assignee: 'alice.brown',
      milestone: 'v1.0',
      created: '2024-01-04T00:00:00.000Z'
    }
  ]

  const mockMoveTicket = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: mockTickets,
      milestones: [],
      addTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      moveTicket: mockMoveTicket,
      addMilestone: vi.fn(),
      updateMilestone: vi.fn()
    })
  })

  describe('Component Rendering', () => {
    it('renders the kanban board with all columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('renders correct column icons', () => {
      render(<KanbanBoard />)
      
      // Check for icons in column headers specifically using more specific selectors
      expect(screen.getByText('To Do').closest('h3')).toHaveTextContent('📝')
      expect(screen.getByText('In Progress').closest('h3')).toHaveTextContent('🔄')
      expect(screen.getByText('Review').closest('h3')).toHaveTextContent('👀')
      expect(screen.getByText('Done').closest('h3')).toHaveTextContent('✅')
    })

    it('displays correct ticket counts in each column', () => {
      render(<KanbanBoard />)
      
      // Each column should show "1" as we have one ticket per status
      const countBadges = screen.getAllByText('1')
      expect(countBadges).toHaveLength(4)
    })

    it('renders tickets in correct columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByTestId('ticket-TKT-001')).toBeInTheDocument() // todo
      expect(screen.getByTestId('ticket-TKT-002')).toBeInTheDocument() // in-progress
      expect(screen.getByTestId('ticket-TKT-003')).toBeInTheDocument() // review
      expect(screen.getByTestId('ticket-TKT-004')).toBeInTheDocument() // done
    })
  })

  describe('Ticket Distribution', () => {
    it('displays tickets in their respective status columns', () => {
      render(<KanbanBoard />)
      
      expect(screen.getByText('Todo Task')).toBeInTheDocument()
      expect(screen.getByText('In Progress Task')).toBeInTheDocument()
      expect(screen.getByText('Review Task')).toBeInTheDocument()
      expect(screen.getByText('Done Task')).toBeInTheDocument()
    })

    it('handles multiple tickets in the same column', () => {
      const multipleTickets: Ticket[] = [
        ...mockTickets,
        {
          id: 'TKT-005',
          title: 'Another Todo Task',
          description: 'Another task in todo',
          status: 'todo',
          priority: 'low',
          assignee: 'charlie.brown',
          milestone: 'v1.0',
          created: '2024-01-05T00:00:00.000Z'
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: multipleTickets,
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Todo column should now have 2 tickets
      expect(screen.getByText('Todo Task')).toBeInTheDocument()
      expect(screen.getByText('Another Todo Task')).toBeInTheDocument()
    })

    it('updates ticket counts correctly with multiple tickets', () => {
      const multipleTickets: Ticket[] = [
        ...mockTickets,
        {
          id: 'TKT-005',
          title: 'Another Todo Task',
          description: 'Another task in todo',
          status: 'todo',
          priority: 'low',
          created: '2024-01-05T00:00:00.000Z'
        },
        {
          id: 'TKT-006',
          title: 'Third Todo Task',
          description: 'Third task in todo',
          status: 'todo',
          priority: 'medium',
          created: '2024-01-06T00:00:00.000Z'
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: multipleTickets,
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Todo column should show "3", others should show "1"
      expect(screen.getByText('3')).toBeInTheDocument() // todo column
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

    it('calls moveTicket when move button is clicked', () => {
      render(<KanbanBoard />)
      
      // Find a move button (there should be multiple for different target columns)
      const moveButtons = screen.getAllByRole('button')
      const firstMoveButton = moveButtons[0]
      
      fireEvent.click(firstMoveButton)
      
      expect(mockMoveTicket).toHaveBeenCalledTimes(1)
    })

    it('does not render move button for current status', () => {
      render(<KanbanBoard />)
      
      // For a ticket in 'todo' status, there should be 3 move buttons (not 4)
      // because it shouldn't have a button to move to its current status
      const allButtons = screen.getAllByRole('button')
      
      // Each ticket should have 3 move buttons (4 statuses - 1 current status)
      // With 4 tickets, we should have 12 total move buttons
      expect(allButtons).toHaveLength(12)
    })

    it('has correct tooltip titles for move buttons', () => {
      render(<KanbanBoard />)
      
      // Check for buttons with title attributes within specific ticket context
      const todoTicket = screen.getByTestId('ticket-TKT-001').closest('.relative')
      const inProgressTicket = screen.getByTestId('ticket-TKT-002').closest('.relative')
      const reviewTicket = screen.getByTestId('ticket-TKT-003').closest('.relative')
      const doneTicket = screen.getByTestId('ticket-TKT-004').closest('.relative')

      // For todo ticket, check available move options
      expect(within(todoTicket! as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
      expect(within(todoTicket! as HTMLElement).getByTitle('Move to Review')).toBeInTheDocument()
      expect(within(todoTicket! as HTMLElement).getByTitle('Move to Done')).toBeInTheDocument()

      // For in-progress ticket, check available move options  
      expect(within(inProgressTicket! as HTMLElement).getByTitle('Move to To Do')).toBeInTheDocument()
      expect(within(inProgressTicket! as HTMLElement).getByTitle('Move to Review')).toBeInTheDocument()
      expect(within(inProgressTicket! as HTMLElement).getByTitle('Move to Done')).toBeInTheDocument()

      // For review ticket, check available move options
      expect(within(reviewTicket! as HTMLElement).getByTitle('Move to To Do')).toBeInTheDocument()
      expect(within(reviewTicket! as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
      expect(within(reviewTicket! as HTMLElement).getByTitle('Move to Done')).toBeInTheDocument()

      // For done ticket, check available move options
      expect(within(doneTicket! as HTMLElement).getByTitle('Move to To Do')).toBeInTheDocument()
      expect(within(doneTicket! as HTMLElement).getByTitle('Move to In Progress')).toBeInTheDocument()
      expect(within(doneTicket! as HTMLElement).getByTitle('Move to Review')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows empty state message when column has no tickets', () => {
      const limitedTickets: Ticket[] = [
        {
          id: 'TKT-001',
          title: 'Only Todo Task',
          description: 'Only task in todo',
          status: 'todo',
          priority: 'high',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: limitedTickets,
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })

      render(<KanbanBoard />)
      
      // Three columns should show empty state
      const emptyMessages = screen.getAllByText('No tickets in this column')
      expect(emptyMessages).toHaveLength(3)
    })

    it('shows correct count of 0 for empty columns', () => {
      const singleTicket: Ticket[] = [
        {
          id: 'TKT-001',
          title: 'Only Todo Task',
          description: 'Only task in todo',
          status: 'todo',
          priority: 'high',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: singleTicket,
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })

      render(<KanbanBoard />)
      
      expect(screen.getByText('1')).toBeInTheDocument() // todo column
      const zeroCountBadges = screen.getAllByText('0')
      expect(zeroCountBadges).toHaveLength(3) // other columns
    })

    it('handles completely empty board', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
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
      
      // Find a specific move button within the todo ticket context and click it
      const todoTicket = screen.getByTestId('ticket-TKT-001').closest('.relative')
      const moveToInProgressButton = within(todoTicket! as HTMLElement).getByTitle('Move to In Progress')
      fireEvent.click(moveToInProgressButton)
      
      expect(mockMoveTicket).toHaveBeenCalledWith('TKT-001', 'in-progress')
    })

    it('handles tickets with missing optional fields', () => {
      const minimalTickets: Ticket[] = [
        {
          id: 'TKT-MINIMAL',
          title: 'Minimal Ticket',
          description: 'Minimal description',
          status: 'todo',
          priority: 'medium',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]

      mockUseTickets.mockReturnValue({
        tickets: minimalTickets,
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: mockMoveTicket,
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })

      render(<KanbanBoard />)
      
      expect(screen.getByText('Minimal Ticket')).toBeInTheDocument()
      expect(screen.getByTestId('ticket-TKT-MINIMAL')).toBeInTheDocument()
    })
  })
})
