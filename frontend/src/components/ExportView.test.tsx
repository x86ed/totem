/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportView from './ExportView.tsx'
import type { Ticket, Milestone } from '../types'
import { useTickets } from '../context/TicketContext'

// Mock the useTickets hook
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn()
}))

const mockUseTickets = vi.mocked(useTickets)

describe('ExportView', () => {
  const mockTickets: Ticket[] = [
    {
      id: 'TKT-001',
      title: 'Test Ticket 1',
      description: 'Description for test ticket 1',
      status: 'open',
      priority: 'high',
      complexity: 'medium',
      persona: 'user',
      collaborator: 'john.doe'
    },
    {
      id: 'TKT-002',
      title: 'Test Ticket 2',
      description: 'Description for test ticket 2',
      status: 'closed',
      priority: 'medium',
      complexity: 'low',
      persona: 'admin',
      collaborator: undefined,
      createdDate: '2024-01-02',
      updatedDate: '2024-01-02'
    }
  ]

  const mockMilestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'Milestone 1',
      description: 'First milestone',
      dueDate: '2024-03-01',
      status: 'active'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: mockTickets,
      milestones: mockMilestones,
      loading: false,
      error: null,
      addTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      moveTicket: vi.fn(),
      addMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
    })
  })

  describe('Component Rendering', () => {
    it('renders the export view with basic elements', () => {
      render(<ExportView />)
      
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText(/Export your tickets and roadmap data/)).toBeInTheDocument()
    })

    it('renders export format options', () => {
      render(<ExportView />)
      
      expect(screen.getByText('Export Tickets')).toBeInTheDocument()
      expect(screen.getByText('Export Roadmap')).toBeInTheDocument()
      expect(screen.getByText('Export All Data')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<ExportView />)
      
      expect(screen.getByRole('button', { name: /Preview/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Download/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Copy to Clipboard/ })).toBeInTheDocument()
    })
  })

  describe('Export Format Selection', () => {
    it('has markdown-tickets selected by default', () => {
      render(<ExportView />)
      
      const markdownTicketsRadio = screen.getByDisplayValue('markdown-tickets')
      expect(markdownTicketsRadio).toBeChecked()
    })

    it('allows selecting different export formats', () => {
      render(<ExportView />)
      
      const roadmapRadio = screen.getByDisplayValue('markdown-roadmap')
      fireEvent.click(roadmapRadio)
      expect(roadmapRadio).toBeChecked()
    })
  })

  describe('Preview Modal', () => {
    it('opens and closes preview modal', () => {
      render(<ExportView />)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      expect(screen.getByText('Export Preview')).toBeInTheDocument()
      
      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)
      
      expect(screen.queryByText('Export Preview')).not.toBeInTheDocument()
    })
  })

  describe('Functionality', () => {
    it('handles download action', () => {
      // Mock the necessary globals for this specific test
      const mockCreateObjectURL = vi.fn(() => 'mock-blob-url')
      const mockRevokeObjectURL = vi.fn()
      const mockClick = vi.fn()
      
      // Store original values
      const originalURL = window.URL
      const originalCreateElement = document.createElement
      
      // Mock URL object
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
        configurable: true,
      })

      // Mock createElement only for anchor elements
      document.createElement = vi.fn((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
          } as unknown as HTMLElement
        }
        return originalCreateElement.call(document, tagName)
      }) as typeof document.createElement

      render(<ExportView />)
      
      const downloadButton = screen.getByRole('button', { name: /Download/ })
      fireEvent.click(downloadButton)
      
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      
      // Restore original values
      Object.defineProperty(window, 'URL', {
        value: originalURL,
        configurable: true,
      })
      document.createElement = originalCreateElement
    })

    it('handles clipboard copy', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      const mockAlert = vi.fn()

      // Store original values
      const originalClipboard = navigator.clipboard
      const originalAlert = window.alert

      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      window.alert = mockAlert

      render(<ExportView />)
      
      const clipboardButton = screen.getByRole('button', { name: /Copy to Clipboard/ })
      fireEvent.click(clipboardButton)
      
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled()
        expect(mockAlert).toHaveBeenCalledWith('Content copied to clipboard!')
      })
      
      // Restore original values
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
      })
      window.alert = originalAlert
    })
  })

  describe('Content Generation', () => {
    it('shows preview content for markdown tickets format', () => {
      render(<ExportView />)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      expect(screen.getByText(/# Ticket: Test Ticket 1/)).toBeInTheDocument()
      // Use getAllByText to handle multiple occurrences and check the preview modal specifically
      const tktElements = screen.getAllByText(/TKT-001/)
      expect(tktElements.length).toBeGreaterThan(0)
      
      // Check that the preview modal is open
      expect(screen.getByText('Export Preview')).toBeInTheDocument()
    })

    it('shows preview content for roadmap format', () => {
      render(<ExportView />)
      
      const roadmapRadio = screen.getByDisplayValue('markdown-roadmap')
      fireEvent.click(roadmapRadio)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      expect(screen.getByText(/# Project Overview/)).toBeInTheDocument()
      expect(screen.getByText(/Generated:/)).toBeInTheDocument()
    })

    it('shows preview content for JSON format', () => {
      render(<ExportView />)
      
      const jsonRadio = screen.getByDisplayValue('json')
      fireEvent.click(jsonRadio)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      expect(screen.getByText(/"exportDate":/)).toBeInTheDocument()
      expect(screen.getByText(/"tickets":/)).toBeInTheDocument()
    })

    it('handles unassigned tickets correctly in markdown', () => {
      render(<ExportView />)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      // Should show "None" for ticket with undefined collaborator
      expect(screen.getByText(/\*\*Collaborator:\*\* None/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty tickets list', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: mockMilestones,
        loading: false,
        error: null,
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn(),
        deleteMilestone: vi.fn(),
      })
      
      render(<ExportView />)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      // Should render preview without crashing
      expect(screen.getByText('Export Preview')).toBeInTheDocument()
    })

    it('handles empty milestones list for roadmap', () => {
      mockUseTickets.mockReturnValue({
        tickets: mockTickets,
        milestones: [],
        loading: false,
        error: null,
        addTicket: vi.fn(),
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn(),
        deleteMilestone: vi.fn(),
      })
      
      render(<ExportView />)
      
      const roadmapRadio = screen.getByDisplayValue('markdown-roadmap')
      fireEvent.click(roadmapRadio)
      
      const previewButton = screen.getByRole('button', { name: /Preview/ })
      fireEvent.click(previewButton)
      
      expect(screen.getByText(/# Project Overview/)).toBeInTheDocument()
    })

    it('handles clipboard error gracefully', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Store original values
      const originalClipboard = navigator.clipboard

      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      render(<ExportView />)
      
      const clipboardButton = screen.getByRole('button', { name: /Copy to Clipboard/ })
      fireEvent.click(clipboardButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to copy content:',
          expect.any(Error)
        )
      })
      
      // Restore original values
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
      })
      consoleSpy.mockRestore()
    })
  })

  describe('Sample Content', () => {
    it('renders sample markdown format section', () => {
      render(<ExportView />)
      
      expect(screen.getByText('Sample Ticket Markdown Format')).toBeInTheDocument()
      expect(screen.getByText(/# Ticket: Fix login validation/)).toBeInTheDocument()
    })
  })
})
