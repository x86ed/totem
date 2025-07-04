/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock all component imports
vi.mock('./components/KanbanBoard', () => ({
  default: () => <div data-testid="kanban-board">Mocked Kanban Board</div>
}))

vi.mock('./components/RoadmapView', () => ({
  default: () => <div data-testid="roadmap-view">Mocked Roadmap View</div>
}))

vi.mock('./components/CreateTicket', () => ({
  default: () => <div data-testid="create-ticket">Mocked Create Ticket</div>
}))

vi.mock('./components/DemoView', () => ({
  default: () => <div data-testid="demo-view">Mocked Demo View</div>
}))

// Mock the TicketProvider context
vi.mock('./context/TicketContext', () => ({
  TicketProvider: vi.fn(({ children }) => (
    <div data-testid="ticket-provider">{children}</div>
  ))
}))

// Mock CSS import
vi.mock('./App.css', () => ({}))

// Import App after mocks are set up
import App from './App'

// Get reference to the mocked TicketProvider
import { TicketProvider } from './context/TicketContext'
const mockTicketProvider = vi.mocked(TicketProvider)

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the main application structure', () => {
      render(<App />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Totem')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument()
    })

    it('should wrap content in TicketProvider', () => {
      render(<App />)

      expect(mockTicketProvider).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('ticket-provider')).toBeInTheDocument()
    })

    it('should render all navigation tabs', () => {
      render(<App />)

      expect(screen.getByRole('button', { name: /📋.*Kanban/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🗺️.*Roadmap/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /➕.*Create Ticket/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🎨.*Demo/i })).toBeInTheDocument()
    })

    it('should apply correct CSS classes and styling', () => {
      render(<App />)

      // Find the actual main div with classes (inside the mocked provider)
      const mainDiv = screen.getByText('Totem').closest('div[class*="min-h-screen"]') as HTMLElement
      expect(mainDiv).toHaveClass('min-h-screen')
      expect(mainDiv).toHaveStyle({ background: '#f0f4f1' })

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('header-green')

      const title = screen.getByText('Totem')
      expect(title).toHaveClass('text-2xl', 'font-bold')
      expect(title).toHaveStyle({ color: '#e8f5e8' })
    })
  })

  describe('Tab Navigation', () => {
    it('should start with Kanban tab active by default', () => {
      render(<App />)

      expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
      expect(screen.queryByTestId('roadmap-view')).not.toBeInTheDocument()
      expect(screen.queryByTestId('create-ticket')).not.toBeInTheDocument()
      expect(screen.queryByTestId('demo-view')).not.toBeInTheDocument()
    })

    it('should show active tab styling on current tab', () => {
      render(<App />)

      const kanbanTab = screen.getByRole('button', { name: /📋.*Kanban/i })
      expect(kanbanTab).toHaveClass('active')

      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })
      expect(roadmapTab).not.toHaveClass('active')
    })

    it('should switch to Roadmap view when Roadmap tab is clicked', () => {
      render(<App />)
      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })

      fireEvent.click(roadmapTab)

      expect(screen.getByTestId('roadmap-view')).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
      expect(screen.queryByTestId('create-ticket')).not.toBeInTheDocument()
      expect(screen.queryByTestId('demo-view')).not.toBeInTheDocument()
    })

    it('should switch to Create Ticket view when Create Ticket tab is clicked', () => {
      render(<App />)
      const createTicketTab = screen.getByRole('button', { name: /➕.*Create Ticket/i })

      fireEvent.click(createTicketTab)

      expect(screen.getByTestId('create-ticket')).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
      expect(screen.queryByTestId('roadmap-view')).not.toBeInTheDocument()
      expect(screen.queryByTestId('demo-view')).not.toBeInTheDocument()
    })

    it('should switch to Demo view when Demo tab is clicked', () => {
      render(<App />)
      const demoTab = screen.getByRole('button', { name: /🎨.*Demo/i })

      fireEvent.click(demoTab)

      expect(screen.getByTestId('demo-view')).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
      expect(screen.queryByTestId('roadmap-view')).not.toBeInTheDocument()
      expect(screen.queryByTestId('create-ticket')).not.toBeInTheDocument()
    })

    it('should update active tab styling when switching tabs', () => {
      render(<App />)
      const kanbanTab = screen.getByRole('button', { name: /📋.*Kanban/i })
      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })

      fireEvent.click(roadmapTab)

      expect(roadmapTab).toHaveClass('active')
      expect(kanbanTab).not.toHaveClass('active')
    })
  })

  describe('Tab Configuration', () => {
    it('should render tabs with correct icons and labels', () => {
      render(<App />)

      const kanbanTab = screen.getByRole('button', { name: /📋.*Kanban/i })
      expect(kanbanTab).toHaveTextContent('📋')
      expect(kanbanTab).toHaveTextContent('Kanban')

      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })
      expect(roadmapTab).toHaveTextContent('🗺️')
      expect(roadmapTab).toHaveTextContent('Roadmap')

      const createTab = screen.getByRole('button', { name: /➕.*Create Ticket/i })
      expect(createTab).toHaveTextContent('➕')
      expect(createTab).toHaveTextContent('Create Ticket')

      const demoTab = screen.getByRole('button', { name: /🎨.*Demo/i })
      expect(demoTab).toHaveTextContent('🎨')
      expect(demoTab).toHaveTextContent('Demo')
    })

    it('should apply correct CSS classes to tab buttons', () => {
      render(<App />)

      const tabs = screen.getAllByRole('button')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('nav-btn-green')
      })
    })

    it('should have proper icon spacing in tabs', () => {
      render(<App />)

      const iconElements = screen.getAllByText(/[📋🗺️➕📁]/)
      iconElements.forEach(icon => {
        expect(icon).toHaveClass('icon-spacing')
      })
    })
  })

  describe('Layout Structure', () => {
    it('should have proper header layout', () => {
      render(<App />)

      const header = screen.getByRole('banner')
      const headerContent = header.firstChild as HTMLElement
      expect(headerContent).toHaveClass('max-w-7xl', 'mx-auto')

      const flexContainer = headerContent.firstChild as HTMLElement
      expect(flexContainer).toHaveClass('flex', 'justify-between', 'items-center', 'py-4')
    })

    it('should have proper main content area', () => {
      render(<App />)

      const main = screen.getByRole('main')
      expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'px-4', 'sm:px-6', 'lg:px-8')
    })
  })

  describe('State Management', () => {
    it('should maintain tab state across multiple interactions', () => {
      render(<App />)
      const kanbanTab = screen.getByRole('button', { name: /📋.*Kanban/i })
      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })
      const createTab = screen.getByRole('button', { name: /➕.*Create Ticket/i })

      fireEvent.click(roadmapTab)
      fireEvent.click(createTab)
      fireEvent.click(kanbanTab)

      expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
      expect(kanbanTab).toHaveClass('active')
    })

    it('should start with correct initial state', () => {
      render(<App />)

      expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
      const kanbanTab = screen.getByRole('button', { name: /📋.*Kanban/i })
      expect(kanbanTab).toHaveClass('active')
    })
  })

  describe('Component Integration', () => {
    it('should properly integrate with TicketProvider', () => {
      render(<App />)

      expect(mockTicketProvider).toHaveBeenCalledTimes(1)
      // Verify the TicketProvider received props with children
      const [propsArgument] = mockTicketProvider.mock.calls[0]
      expect(propsArgument).toHaveProperty('children')
      expect(propsArgument.children).toBeDefined()
    })

    it('should conditionally render only one view component at a time', () => {
      render(<App />)

      const tabs = [
        { button: /📋.*Kanban/i, testId: 'kanban-board' },
        { button: /🗺️.*Roadmap/i, testId: 'roadmap-view' },
        { button: /➕.*Create Ticket/i, testId: 'create-ticket' },
        { button: /🎨.*Demo/i, testId: 'demo-view' }
      ]

      tabs.forEach(({ button, testId }) => {
        const tabButton = screen.getByRole('button', { name: button })
        fireEvent.click(tabButton)

        expect(screen.getByTestId(testId)).toBeInTheDocument()
        
        const otherTestIds = tabs.filter(t => t.testId !== testId).map(t => t.testId)
        otherTestIds.forEach(otherTestId => {
          expect(screen.queryByTestId(otherTestId)).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      render(<App />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should have accessible tab buttons', () => {
      render(<App />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
      
      buttons.forEach(button => {
        expect(button).toBeVisible()
        expect(button).not.toBeDisabled()
      })
    })

    it('should have proper heading structure', () => {
      render(<App />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Totem')
    })
  })

  describe('Error Handling', () => {
    it('should handle rapid tab switching gracefully', () => {
      render(<App />)

      const roadmapTab = screen.getByRole('button', { name: /🗺️.*Roadmap/i })
      
      fireEvent.click(roadmapTab)
      fireEvent.click(roadmapTab)
      fireEvent.click(roadmapTab)

      expect(screen.getByTestId('roadmap-view')).toBeInTheDocument()
    })

    it('should render without crashing when no props are provided', () => {
      expect(() => render(<App />)).not.toThrow()
    })
  })
})
