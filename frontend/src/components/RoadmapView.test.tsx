/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoadmapView from './RoadmapView.tsx'
import type { Ticket, Milestone } from '../types'
import { useTickets } from '../context/TicketContext'

// Mock the useTickets hook
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn()
}))

const mockUseTickets = vi.mocked(useTickets)

describe('RoadmapView', () => {
  const mockTickets: Ticket[] = [
    {
      id: 'TKT-001',
      title: 'Implement authentication',
      description: 'Add user login and registration functionality',
      status: 'done',
      priority: 'high',
      assignee: 'john.doe',
      milestone: 'v1.0',
      created: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'TKT-002',
      title: 'Add dark mode',
      description: 'Implement dark theme toggle',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'jane.smith',
      milestone: 'v1.0',
      created: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 'TKT-003',
      title: 'Fix navigation bug',
      description: 'Resolve mobile navigation issues',
      status: 'review',
      priority: 'low',
      assignee: 'bob.wilson',
      milestone: 'v1.1',
      created: '2024-01-03T00:00:00.000Z'
    },
    {
      id: 'TKT-004',
      title: 'Database optimization',
      description: 'Optimize query performance',
      status: 'todo',
      priority: 'high',
      milestone: 'v2.0',
      created: '2024-01-04T00:00:00.000Z'
    }
  ]

  const mockMilestones: Milestone[] = [
    {
      id: 'v1.0',
      title: 'First Release',
      description: 'Initial version with core features',
      status: 'active',
      dueDate: '2024-06-30T23:59:59.000Z'
    },
    {
      id: 'v1.1',
      title: 'Bug Fixes',
      description: 'Minor improvements and bug fixes',
      status: 'planning',
      dueDate: '2024-07-15T23:59:59.000Z'
    },
    {
      id: 'empty-milestone',
      title: 'Empty Milestone',
      description: 'Milestone with no tickets',
      status: 'planning',
      dueDate: '2024-08-01T23:59:59.000Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: mockTickets,
      milestones: mockMilestones,
      addTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      moveTicket: vi.fn(),
      addMilestone: vi.fn(),
      updateMilestone: vi.fn()
    })
  })

  describe('Component Rendering', () => {
    it('renders the roadmap view with correct title', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Project Roadmap')).toBeInTheDocument()
      expect(screen.getByText('🗺️')).toBeInTheDocument()
    })

    it('renders all milestones', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('First Release')).toBeInTheDocument()
      expect(screen.getByText('Bug Fixes')).toBeInTheDocument()
      expect(screen.getByText('Empty Milestone')).toBeInTheDocument()
    })

    it('renders milestone descriptions', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Initial version with core features')).toBeInTheDocument()
      expect(screen.getByText('Minor improvements and bug fixes')).toBeInTheDocument()
    })

    it('renders milestone due dates', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Jun 30, 2024')).toBeInTheDocument()
      expect(screen.getByText('Jul 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Aug 1, 2024')).toBeInTheDocument()
    })
  })

  describe('Progress Calculation', () => {
    it('calculates correct progress for milestones with tickets', () => {
      render(<RoadmapView />)
      
      // v1.0 has 2 tickets: 1 done, 1 in-progress = 50%
      expect(screen.getByText(/Progress: 50% \(1\/2 completed\)/)).toBeInTheDocument()
      
      // v1.1 has 1 ticket: 0 done = 0%
      expect(screen.getByText(/Progress: 0% \(0\/1 completed\)/)).toBeInTheDocument()
    })

    it('shows 0% progress for milestones with no tickets', () => {
      render(<RoadmapView />)
      
      // empty-milestone has no tickets = 0%
      expect(screen.getByText(/Progress: 0% \(0\/0 completed\)/)).toBeInTheDocument()
    })

    it('displays correct ticket counts', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Tickets (2)')).toBeInTheDocument() // v1.0
      expect(screen.getByText('Tickets (1)')).toBeInTheDocument() // v1.1
      expect(screen.getByText('Tickets (0)')).toBeInTheDocument() // empty-milestone
    })

    it('handles 100% progress calculation', () => {
      const allDoneTickets: Ticket[] = [
        {
          id: 'TKT-DONE-1',
          title: 'Done Ticket 1',
          description: 'Test',
          status: 'done',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'TKT-DONE-2',
          title: 'Done Ticket 2',
          description: 'Test',
          status: 'done',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]
      
      mockUseTickets.mockReturnValue({
        tickets: allDoneTickets,
        milestones: [mockMilestones[0]],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      expect(screen.getByText(/Progress: 100% \(2\/2 completed\)/)).toBeInTheDocument()
    })

    it('handles rounding of progress percentages', () => {
      const partialProgressTickets: Ticket[] = [
        {
          id: 'TKT-DONE-1',
          title: 'Done Ticket',
          description: 'Test',
          status: 'done',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'TKT-TODO-1',
          title: 'Todo Ticket 1',
          description: 'Test',
          status: 'todo',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'TKT-TODO-2',
          title: 'Todo Ticket 2',
          description: 'Test',
          status: 'todo',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]
      
      mockUseTickets.mockReturnValue({
        tickets: partialProgressTickets,
        milestones: [mockMilestones[0]],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      // 1/3 = 33.33%, should round to 33%
      expect(screen.getByText(/Progress: 33% \(1\/3 completed\)/)).toBeInTheDocument()
    })
  })

  describe('Ticket Display', () => {
    it('renders tickets with correct information', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Implement authentication')).toBeInTheDocument()
      expect(screen.getByText('Add dark mode')).toBeInTheDocument()
      expect(screen.getByText('Fix navigation bug')).toBeInTheDocument()
      
      expect(screen.getByText('(TKT-001)')).toBeInTheDocument()
      expect(screen.getByText('(TKT-002)')).toBeInTheDocument()
      expect(screen.getByText('(TKT-003)')).toBeInTheDocument()
    })

    it('renders ticket descriptions', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Add user login and registration functionality')).toBeInTheDocument()
      expect(screen.getByText('Implement dark theme toggle')).toBeInTheDocument()
      expect(screen.getByText('Resolve mobile navigation issues')).toBeInTheDocument()
    })

    it('renders assignees when present', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('Assigned to: john.doe')).toBeInTheDocument()
      expect(screen.getByText('Assigned to: jane.smith')).toBeInTheDocument()
      expect(screen.getByText('Assigned to: bob.wilson')).toBeInTheDocument()
    })

    it('does not render assignee section when assignee is not present', () => {
      const ticketsWithoutAssignee = [
        {
          id: 'TKT-NO-ASSIGNEE',
          title: 'No assignee ticket',
          description: 'This ticket has no assignee',
          status: 'todo' as const,
          priority: 'low' as const,
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]
      
      mockUseTickets.mockReturnValue({
        tickets: ticketsWithoutAssignee,
        milestones: mockMilestones,
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument()
    })
  })

  describe('Status Icons and Priority Classes', () => {
    it('renders correct status icons for different ticket statuses', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('✅')).toBeInTheDocument() // done
      expect(screen.getByText('🔄')).toBeInTheDocument() // in-progress
      expect(screen.getByText('👀')).toBeInTheDocument() // review
    })

    it('applies correct priority classes to tickets', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
      expect(screen.getByText('low')).toBeInTheDocument()
    })

    it('handles all priority types in getPriorityClass', () => {
      const testTickets: Ticket[] = [
        {
          id: 'TKT-HIGH',
          title: 'High Priority',
          description: 'Test',
          status: 'todo',
          priority: 'high',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'TKT-MEDIUM',
          title: 'Medium Priority',
          description: 'Test',
          status: 'todo',
          priority: 'medium',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'TKT-LOW',
          title: 'Low Priority',
          description: 'Test',
          status: 'todo',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z'
        }
      ]
      
      mockUseTickets.mockReturnValue({
        tickets: testTickets,
        milestones: [mockMilestones[0]],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      const highPriorityElement = screen.getByText('high')
      const mediumPriorityElement = screen.getByText('medium')
      const lowPriorityElement = screen.getByText('low')
      
      expect(highPriorityElement).toHaveClass('priority-high-green')
      expect(mediumPriorityElement).toHaveClass('priority-medium-green')
      expect(lowPriorityElement).toHaveClass('priority-low-green')
    })
  })

  describe('Empty States', () => {
    it('shows empty state for milestones with no tickets', () => {
      render(<RoadmapView />)
      
      expect(screen.getByText('No tickets assigned to this milestone')).toBeInTheDocument()
    })

    it('handles empty milestones list', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      expect(screen.getByText('Project Roadmap')).toBeInTheDocument()
      expect(screen.queryByText('First Release')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles tickets with no milestone gracefully', () => {
      const ticketWithoutMilestone: Ticket = {
        id: 'TKT-NO-MILESTONE',
        title: 'No milestone ticket',
        description: 'Ticket without milestone',
        status: 'todo',
        priority: 'low',
        created: '2024-01-05T00:00:00.000Z'
      }

      mockUseTickets.mockReturnValue({
        tickets: [...mockTickets, ticketWithoutMilestone],
        milestones: mockMilestones,
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      // Ticket without milestone shouldn't appear in any milestone section
      expect(screen.queryByText('No milestone ticket')).not.toBeInTheDocument()
    })

    it('formats dates correctly for different date formats', () => {
      const milestonesWithDifferentDates: Milestone[] = [
        {
          id: 'test-1',
          title: 'Test Milestone 1',
          description: 'Test',
          status: 'planning',
          dueDate: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'test-2',
          title: 'Test Milestone 2',
          description: 'Test',
          status: 'planning',
          dueDate: '2024-12-25T00:00:00.000Z'
        }
      ]
      
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: milestonesWithDifferentDates,
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn()
      })
      
      render(<RoadmapView />)
      
      expect(screen.getByText('Dec 31, 2023')).toBeInTheDocument()
      expect(screen.getByText('Dec 24, 2024')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies correct CSS classes to milestone elements', () => {
      render(<RoadmapView />)
      
      const milestoneElements = screen.getAllByText(/First Release|Bug Fixes|Empty Milestone/)
      milestoneElements.forEach(element => {
        const milestoneContainer = element.closest('.milestone-green')
        expect(milestoneContainer).toBeInTheDocument()
      })
    })

    it('applies correct background colors based on ticket status', () => {
      render(<RoadmapView />)
      
      const ticketTitles = screen.getAllByText(/Implement authentication|Add dark mode|Fix navigation bug|Database optimization/)
      ticketTitles.forEach(title => {
        const ticketContainer = title.closest('.milestone-ticket')
        expect(ticketContainer).toBeInTheDocument()
      })
    })

    it('displays progress bars with correct styling', () => {
      render(<RoadmapView />)
      
      const progressBars = document.querySelectorAll('.progress-bar-green')
      expect(progressBars.length).toBeGreaterThan(0)
      
      const progressFills = document.querySelectorAll('.progress-fill-green')
      expect(progressFills.length).toBeGreaterThan(0)
    })
  })
})
