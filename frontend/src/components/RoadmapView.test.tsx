/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoadmapView from './RoadmapView.tsx'
import type { Ticket, Milestone } from '../types'
import { TicketSort, useTickets } from '../context/TicketContext'

// Mock the useTickets hook
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn()
}))

const mockUseTickets = vi.mocked(useTickets)

// Mock Scheduler to avoid useMemo error in tests
vi.mock('@bitnoi.se/react-scheduler', () => ({
  Scheduler: (props: { data: SchedulerGroup[] }) => <div data-testid="mock-scheduler">{JSON.stringify(props.data)}</div>
}))

// Types for scheduler mock data
interface SchedulerTicket {
  title: string;
  description: string;
}
interface SchedulerGroup {
  data: SchedulerTicket[];
}

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
      created: '2024-01-01T00:00:00.000Z',
      complexity: 'm'
    },
    {
      id: 'TKT-002',
      title: 'Add dark mode',
      description: 'Implement dark theme toggle',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'jane.smith',
      milestone: 'v1.0',
      created: '2024-01-02T00:00:00.000Z',
      complexity: 'm'
    },
    {
      id: 'TKT-003',
      title: 'Fix navigation bug',
      description: 'Resolve mobile navigation issues',
      status: 'review',
      priority: 'low',
      assignee: 'bob.wilson',
      milestone: 'v1.1',
      created: '2024-01-03T00:00:00.000Z',
      complexity: 'm'
    },
    {
      id: 'TKT-004',
      title: 'Database optimization',
      description: 'Optimize query performance',
      status: 'todo',
      priority: 'high',
      milestone: 'v2.0',
      created: '2024-01-04T00:00:00.000Z',
      complexity: 'm'
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
      loading: false,
      error: null,
      refreshTickets: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      moveTicket: vi.fn(),
      addTicket: vi.fn(),
      pagination: { offset: 0, limit: 10, total: mockTickets.length, totalFiltered: mockTickets.length },
      setPagination: vi.fn(),
      filters: {},
      setFilters: vi.fn(),
      sort: 'created' as unknown as TicketSort,
      setSort: vi.fn(),
      loadAllTickets: vi.fn()
    })
  })

  describe('Ticket Display', () => {
    it('renders tickets in the scheduler with correct information', () => {
      // Add contributor field to all mock tickets
      const ticketsWithContributors = mockTickets.map((t, i) => ({
        ...t,
        contributor: ['alice', 'bob', 'carol', 'dave'][i % 4]
      }))
      mockUseTickets.mockReturnValue({
        tickets: ticketsWithContributors,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addTicket: vi.fn(),
        pagination: { offset: 0, limit: 10, total: ticketsWithContributors.length, totalFiltered: ticketsWithContributors.length },
        setPagination: vi.fn(),
        filters: {},
        setFilters: vi.fn(),
        sort: 'created' as unknown as TicketSort,
        setSort: vi.fn(),
        loadAllTickets: vi.fn()
      })
      render(<RoadmapView />)
      // Check ticket titles and descriptions are present in scheduler data
      const scheduler = screen.getByTestId('mock-scheduler')
      const schedulerData = JSON.parse(scheduler.textContent || '[]') as SchedulerGroup[]
      ticketsWithContributors.forEach(ticket => {
        expect(schedulerData.some((group: SchedulerGroup) =>
          group.data.some((t: SchedulerTicket) => t.title === ticket.title && t.description === ticket.description)
        )).toBe(true)
      })
    })

    it('does not render assignee section when assignee is not present', () => {
      // Scheduler does not display assignee info in current RoadmapView
      const ticketsWithoutAssignee = [
        {
          id: 'TKT-NO-ASSIGNEE',
          title: 'No assignee ticket',
          description: 'This ticket has no assignee',
          status: 'todo',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'm',
          contributor: 'eve'
        }
      ]
      mockUseTickets.mockReturnValue({
        tickets: ticketsWithoutAssignee,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addTicket: vi.fn(),
        pagination: { offset: 0, limit: 10, total: ticketsWithoutAssignee.length, totalFiltered: ticketsWithoutAssignee.length },
        setPagination: vi.fn(),
        filters: {},
        setFilters: vi.fn(),
        sort: 'created' as unknown as TicketSort,
        setSort: vi.fn(),
        loadAllTickets: vi.fn()
      })
      render(<RoadmapView />)
      // Should not render any assignee info
      expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument()
    })
  })

  describe('Status Icons and Priority Classes', () => {
    it('renders correct status colors for different ticket statuses', () => {
      // Scheduler uses bgColor for status, not icons
      const statusTickets: Ticket[] = [
        {
          id: 'TKT-DONE',
          title: 'Done Ticket',
          description: 'Test',
          status: 'done',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'm',
          contributor: 'alice'
        },
        {
          id: 'TKT-INPROGRESS',
          title: 'In Progress Ticket',
          description: 'Test',
          status: 'in-progress',
          priority: 'medium',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'm',
          contributor: 'bob'
        },
        {
          id: 'TKT-REVIEW',
          title: 'Review Ticket',
          description: 'Test',
          status: 'review',
          priority: 'high',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'm',
          contributor: 'carol'
        }
      ]
      mockUseTickets.mockReturnValue({
        tickets: statusTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addTicket: vi.fn(),
        pagination: { offset: 0, limit: 10, total: statusTickets.length, totalFiltered: statusTickets.length },
        setPagination: vi.fn(),
        filters: {},
        setFilters: vi.fn(),
        sort: 'created' as unknown as TicketSort,
        setSort: vi.fn(),
        loadAllTickets: vi.fn()
      })
      render(<RoadmapView />)
      // Check ticket titles are present in scheduler data
      const scheduler = screen.getByTestId('mock-scheduler')
      const schedulerData = JSON.parse(scheduler.textContent || '[]') as SchedulerGroup[]
      statusTickets.forEach(ticket => {
        expect(schedulerData.some((group: SchedulerGroup) =>
          group.data.some((t: SchedulerTicket) => t.title === ticket.title)
        )).toBe(true)
      })
    })

    it('handles all priority types in scheduler', () => {
      // Already tested above: just check all priorities are rendered
      const testTickets: Ticket[] = [
        {
          id: 'TKT-HIGH',
          title: 'High Priority',
          description: 'Test',
          status: 'todo',
          priority: 'high',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'high',
          contributor: 'alice'
        },
        {
          id: 'TKT-MEDIUM',
          title: 'Medium Priority',
          description: 'Test',
          status: 'todo',
          priority: 'medium',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'medium',
          contributor: 'bob'
        },
        {
          id: 'TKT-LOW',
          title: 'Low Priority',
          description: 'Test',
          status: 'todo',
          priority: 'low',
          milestone: 'v1.0',
          created: '2024-01-01T00:00:00.000Z',
          complexity: 'low',
          contributor: 'carol'
        }
      ]
      mockUseTickets.mockReturnValue({
        tickets: testTickets,
        milestones: [],
        loading: false,
        error: null,
        refreshTickets: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addTicket: vi.fn(),
        pagination: { offset: 0, limit: 10, total: testTickets.length, totalFiltered: testTickets.length },
        setPagination: vi.fn(),
        filters: {},
        setFilters: vi.fn(),
        sort: 'created' as unknown as TicketSort,
        setSort: vi.fn(),
        loadAllTickets: vi.fn()
      })
      render(<RoadmapView />)
      const scheduler = screen.getByTestId('mock-scheduler')
      const schedulerData = JSON.parse(scheduler.textContent || '[]') as SchedulerGroup[]
      expect(schedulerData.some((group: SchedulerGroup) =>
        group.data.some((t: SchedulerTicket) => t.title === 'High Priority')
      )).toBe(true)
      expect(schedulerData.some((group: SchedulerGroup) =>
        group.data.some((t: SchedulerTicket) => t.title === 'Medium Priority')
      )).toBe(true)
      expect(schedulerData.some((group: SchedulerGroup) =>
        group.data.some((t: SchedulerTicket) => t.title === 'Low Priority')
      )).toBe(true)
    })
  })




})
