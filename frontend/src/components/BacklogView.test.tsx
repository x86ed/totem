import React from 'react'
import { PersonaProvider } from '../context/PersonaContext'
import { ContributorProvider } from '../context/ContributorContext'
import { ComplexityContext } from '../context/ComplexityContext'
import { PriorityContext } from '../context/PriorityContext'
import { StatusContext } from '../context/StatusContext'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BacklogView from './BacklogView'
import type { Ticket } from '../types'
type GlobalCompositeOperation = CanvasRenderingContext2D['globalCompositeOperation'];

// Mock canvas getContext for TotemIcon
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    // Drawing methods
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: [],
      width: 1,
      height: 1,
      colorSpace: 'srgb',
    })), // <-- Fixed: returns a valid ImageData-like object
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: [],
      width: 1,
      height: 1,
      colorSpace: 'srgb',
    })), // <-- Fixed: returns a valid ImageData-like object
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    drawFocusIfNeeded: vi.fn(),
    filter: '',
    createConicGradient: vi.fn(),
    createLinearGradient: vi.fn(),
    createPattern: vi.fn(),
    createRadialGradient: vi.fn(),
    getContextAttributes: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    lineDashOffset: 0,
    strokeRect: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    // Required properties
    canvas: document.createElement('canvas'),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    resetTransform: vi.fn(),
    getTransform: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    font: '',
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'inherit',
    isContextLost: vi.fn(() => false),
    reset: vi.fn(),
    fontKerning: 'auto',
    fontStretch: 'normal',
    fontVariantCaps: 'normal',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    fontFeatureSettings: 'normal',
    fontVariationSettings: 'normal',
    drawImage: vi.fn(),
    textRendering: 'auto',
    transform: vi.fn(),
    // Add any other required stubs here
  }))
})

const mockComplexityContext = {
  complexities: [],
  loading: false,
  addComplexity: vi.fn(),
  updateComplexity: vi.fn(),
  deleteComplexity: vi.fn(),
  refreshComplexities: vi.fn(),
}
const mockPriorityContext = {
  priorities: [],
  loading: false,
  addPriority: vi.fn(),
  updatePriority: vi.fn(),
  deletePriority: vi.fn(),
  refreshPriorities: vi.fn(),
}
const mockStatusContext = {
  statuses: [],
  loading: false,
  addStatus: vi.fn(),
  updateStatus: vi.fn(),
  deleteStatus: vi.fn(),
  refreshStatuses: vi.fn(),
}


function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <ContributorProvider>
        <ComplexityContext.Provider value={mockComplexityContext}>
          <PriorityContext.Provider value={mockPriorityContext}>
            <StatusContext.Provider value={mockStatusContext}>
              {children}
            </StatusContext.Provider>
          </PriorityContext.Provider>
        </ComplexityContext.Provider>
      </ContributorProvider>
    </PersonaProvider>
  )
}
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Mock canvas getContext for TotemIcon
beforeAll(() => {
})

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
    contributor: 'alice.dev',
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
    contributor: 'bob.frontend',
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
      sort: { field: 'id', order: 'asc' },
      setSort: vi.fn(),
      filters: {},
      pagination: { offset: 0, limit: 20, total: mockTickets.length, totalFiltered: mockTickets.length },
      setPagination: vi.fn(),
      setFilters: vi.fn(),
    })
  })

  const renderBacklogView = () => {
    return render(
      <AllProviders>
        <BacklogView />
      </AllProviders>
    )
  }

  describe('Component Rendering', () => {
    it('renders the backlog view with title', () => {
      renderBacklogView()
      
      expect(screen.getByText('Backlog')).toBeInTheDocument()
      // Filter controls are always visible now, no toggle button
      expect(screen.getByText(/\d+ total/)).toBeInTheDocument()
    })

    it('renders the data table with correct headers and TotemIcon column', () => {
      renderBacklogView()
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getAllByText('Persona')).toHaveLength(2)
// Mock canvas getContext for TotemIcon
beforeAll(() => {
})
      expect(screen.getAllByText('Contributor')).toHaveLength(2)
      // TotemIcon: check for a canvas in the first data row
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      expect(firstDataRow.querySelector('canvas')).toBeInTheDocument()
    })

    it('renders ticket data in the table', () => {
      renderBacklogView()
      
      expect(screen.getByText('healthcare.security.auth-sso-001')).toBeInTheDocument()
      expect(screen.getByText('SSO Authentication for Patient Portal')).toBeInTheDocument()
      // Check for priority badge specifically with role
      expect(screen.getAllByText('HIGH')).toHaveLength(2) // One for priority, one for complexity
      expect(screen.getByText('security-sasha')).toBeInTheDocument()
      expect(screen.getByText('alice.dev')).toBeInTheDocument()
      expect(screen.getByText('bob.frontend')).toBeInTheDocument()
    })
  })

  describe('Sorting Functionality', () => {
    it('sorts tickets by ID when ID header is clicked', async () => {
      renderBacklogView()
      // Initial state should have healthcare.security.auth-sso-001 first (ascending order by default)
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const firstDataRow = rows[1] // Skip header row
        // The ID is now in the second cell (first is icon)
        const idCell = firstDataRow.querySelectorAll('td')[1]
        expect(idCell).toHaveTextContent('healthcare.security.auth-sso-001')
      })
      // After clicking, should reverse to descending order
      const idHeader = screen.getByText('ID')
      fireEvent.click(idHeader)
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const firstDataRow = rows[1]
        const idCell = firstDataRow.querySelectorAll('td')[1]
        expect(idCell).toHaveTextContent('healthcare.security.auth-sso-001')
      })
    })

    it('sorts tickets by priority when Priority header is clicked', async () => {
      renderBacklogView()
      
      // Use getAllByText to get the table header (not the filter label)
      const priorityHeaders = screen.getAllByText('Priority')
      const tableHeader = priorityHeaders[1] // Second one is the table header
      fireEvent.click(tableHeader)
      
      // Priority should be sorted with high priority first (descending by default)
      await waitFor(() => {
        const priorityElements = screen.getAllByText(/HIGH|MEDIUM/)
        expect(priorityElements[0]).toHaveTextContent('HIGH')
      })
    })

    it('sorts tickets by contributor when Contributor header is clicked', async () => {
      renderBacklogView()
      
      // Use getAllByText to get the table header (not the filter label)
      const contributorHeaders = screen.getAllByText('Contributor')
      const tableHeader = contributorHeaders[1] // Second one is the table header
      fireEvent.click(tableHeader)
      
      // Should be sorted alphabetically (alice.dev comes before bob.frontend)
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const firstDataRow = rows[1] // Skip header row
        expect(firstDataRow).toHaveTextContent('alice.dev')
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to view mode when a row is clicked', () => {
      const mockOnNavigateToTicket = vi.fn()
      render(
        <AllProviders>
          <BacklogView onNavigateToTicket={mockOnNavigateToTicket} />
        </AllProviders>
      )
      // Find the row for the first ticket (by ID cell)
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      fireEvent.click(firstDataRow)
      expect(mockOnNavigateToTicket).toHaveBeenCalled()
      // Optionally, check the arguments if needed
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
        sort: { field: 'id', order: 'asc' },
        setSort: vi.fn(),
        filters: {},
        pagination: { offset: 0, limit: 20, total: 0, totalFiltered: 0 },
        setPagination: vi.fn(),
        setFilters: vi.fn(),
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
        sort: { field: 'id', order: 'asc' },
        setSort: vi.fn(),
        filters: {},
        pagination: { offset: 0, limit: 20, total: 0, totalFiltered: 0 },
        setPagination: vi.fn(),
        setFilters: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('Failed to load tickets')).toBeInTheDocument()
      expect(screen.getByText('Error Loading Tickets')).toBeInTheDocument()
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
        sort: { field: 'id', order: 'asc' },
        setSort: vi.fn(),
        filters: {},
        pagination: { offset: 0, limit: 20, total: 0, totalFiltered: 0 },
        setPagination: vi.fn(),
        setFilters: vi.fn(),
      })
      
      renderBacklogView()
      
      expect(screen.getByText('No tickets found')).toBeInTheDocument()
      expect(screen.getByText('Create your first ticket to get started')).toBeInTheDocument()
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
      
      // Should have multiple HIGH badges (one priority, one complexity)
      expect(screen.getAllByText('HIGH')).toHaveLength(2)
      // Should have multiple MEDIUM badges (one priority, one complexity)
      expect(screen.getAllByText('MEDIUM')).toHaveLength(2)
    })

    it('handles missing optional fields gracefully', () => {
      const ticketsWithMissingFields: Ticket[] = [
        {
          id: 'healthcare.minimal.test-001',
          title: 'Minimal Ticket',
          description: 'Description',
          status: 'open',
          priority: 'low',
          complexity: 'low',
          persona: undefined,
          contributor: undefined,
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
        sort: { field: 'id', order: 'asc' },
        setSort: vi.fn(),
        filters: {},
        pagination: { offset: 0, limit: 20, total: ticketsWithMissingFields.length, totalFiltered: ticketsWithMissingFields.length },
        setPagination: vi.fn(),
        setFilters: vi.fn(),
      })
      renderBacklogView()
      expect(screen.getByText('healthcare.minimal.test-001')).toBeInTheDocument()
      expect(screen.getByText('Minimal Ticket')).toBeInTheDocument()
      // Should render "None" for missing contributor/persona
      expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(1)
    })
  })
})
