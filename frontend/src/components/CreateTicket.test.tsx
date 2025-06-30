/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateTicket from './CreateTicket.tsx'
import type { Milestone } from '../types'
import { useTickets } from '../context/TicketContext'

// Mock the useTickets hook
vi.mock('../context/TicketContext', () => ({
  useTickets: vi.fn()
}))

const mockUseTickets = vi.mocked(useTickets)

describe('CreateTicket', () => {
  const mockMilestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'Version 1.0',
      description: 'First release',
      dueDate: '2024-03-01',
      status: 'active'
    },
    {
      id: 'milestone-2',
      title: 'Version 2.0',
      description: 'Second release',
      dueDate: '2024-06-01',
      status: 'planning'
    }
  ]

  const mockAddTicket = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTickets.mockReturnValue({
      tickets: [],
      milestones: mockMilestones,
      addTicket: mockAddTicket,
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      moveTicket: vi.fn(),
      addMilestone: vi.fn(),
      updateMilestone: vi.fn(),
    })
  })

  describe('Component Rendering', () => {
    it('renders the create ticket form with all required elements', () => {
      render(<CreateTicket />)
      
      expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter ticket title')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Describe the ticket requirements...')).toBeInTheDocument()
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter assignee name')).toBeInTheDocument()
      expect(screen.getByLabelText(/Milestone/)).toBeInTheDocument()
    })

    it('renders form fields with correct initial values', () => {
      render(<CreateTicket />)
      
      const titleInput = screen.getByPlaceholderText('Enter ticket title') as HTMLInputElement
      const descriptionInput = screen.getByPlaceholderText('Describe the ticket requirements...') as HTMLTextAreaElement
      const prioritySelect = screen.getByLabelText(/Priority/) as HTMLSelectElement
      const assigneeInput = screen.getByPlaceholderText('Enter assignee name') as HTMLInputElement
      const milestoneSelect = screen.getByLabelText(/Milestone/) as HTMLSelectElement

      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
      expect(prioritySelect.value).toBe('medium')
      expect(assigneeInput.value).toBe('')
      expect(milestoneSelect.value).toBe('')
    })

    it('renders action buttons', () => {
      render(<CreateTicket />)
      
      expect(screen.getByRole('button', { name: /Create Ticket/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reset Form/ })).toBeInTheDocument()
    })

    it('renders milestone options correctly', () => {
      render(<CreateTicket />)
      
      expect(screen.getByText('Version 1.0 (2024-03-01)')).toBeInTheDocument()
      expect(screen.getByText('Version 2.0 (2024-06-01)')).toBeInTheDocument()
    })

    it('renders priority options correctly', () => {
      render(<CreateTicket />)
      
      expect(screen.getByText('🟢 Low')).toBeInTheDocument()
      expect(screen.getByText('⚡ Medium')).toBeInTheDocument()
      expect(screen.getByText('🔥 High')).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('updates form fields when user types', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      const titleInput = screen.getByPlaceholderText('Enter ticket title')
      const descriptionInput = screen.getByPlaceholderText('Describe the ticket requirements...')
      const assigneeInput = screen.getByPlaceholderText('Enter assignee name')

      await user.type(titleInput, 'Test Ticket Title')
      await user.type(descriptionInput, 'Test description')
      await user.type(assigneeInput, 'john.doe')

      expect(titleInput).toHaveValue('Test Ticket Title')
      expect(descriptionInput).toHaveValue('Test description')
      expect(assigneeInput).toHaveValue('john.doe')
    })

    it('updates priority when selection changes', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      const prioritySelect = screen.getByRole('combobox', { name: /priority/i })
      
      await user.selectOptions(prioritySelect, 'high')
      expect(prioritySelect).toHaveValue('high')
    })

    it('updates milestone when selection changes', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      const milestoneSelect = screen.getByRole('combobox', { name: /milestone/i })
      
      await user.selectOptions(milestoneSelect, 'milestone-1')
      expect(milestoneSelect).toHaveValue('milestone-1')
    })
  })

  describe('Form Submission', () => {
    it('creates a ticket with correct data when form is submitted', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Fill out the form
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Test Ticket')
      await user.type(screen.getByPlaceholderText('Describe the ticket requirements...'), 'Test description')
      await user.selectOptions(screen.getByRole('combobox', { name: /priority/i }), 'high')
      await user.type(screen.getByPlaceholderText('Enter assignee name'), 'john.doe')
      await user.selectOptions(screen.getByRole('combobox', { name: /milestone/i }), 'milestone-1')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(mockAddTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Ticket',
          description: 'Test description',
          priority: 'high',
          assignee: 'john.doe',
          milestone: 'milestone-1',
          status: 'todo',
          id: expect.stringMatching(/^TKT-\d{4}$/),
          created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
        })
      )
    })

    it('generates unique ticket IDs', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Submit form twice
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'First Ticket')
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))
      
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Second Ticket')
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(mockAddTicket).toHaveBeenCalledTimes(2)
      
      const firstCall = mockAddTicket.mock.calls[0][0]
      const secondCall = mockAddTicket.mock.calls[1][0]
      
      expect(firstCall.id).not.toBe(secondCall.id)
      expect(firstCall.id).toMatch(/^TKT-\d{4}$/)
      expect(secondCall.id).toMatch(/^TKT-\d{4}$/)
    })

    it('resets form after successful submission', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Fill out the form
      const titleInput = screen.getByPlaceholderText('Enter ticket title')
      const descriptionInput = screen.getByPlaceholderText('Describe the ticket requirements...')
      const assigneeInput = screen.getByPlaceholderText('Enter assignee name')
      
      await user.type(titleInput, 'Test Ticket')
      await user.type(descriptionInput, 'Test description')
      await user.type(assigneeInput, 'john.doe')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      // Check that form is reset
      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
      expect(assigneeInput).toHaveValue('')
      expect(screen.getByRole('combobox', { name: /priority/i })).toHaveValue('medium')
    })

    it('shows success message after ticket creation', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Test Ticket')
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(screen.getByText('Ticket created successfully!')).toBeInTheDocument()
    })

    it('hides success message after timeout', async () => {
      const user = userEvent.setup()
      
      render(<CreateTicket />)
      
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Test Ticket')
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(screen.getByText('Ticket created successfully!')).toBeInTheDocument()
      
      // Wait for the timeout to occur (the component uses a 3000ms timeout)
      await waitFor(() => {
        expect(screen.queryByText('Ticket created successfully!')).not.toBeInTheDocument()
      }, { timeout: 4000 })
    })
  })

  describe('Reset Functionality', () => {
    it('resets form when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Fill out the form using placeholder text instead of labels
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Test Ticket')
      await user.type(screen.getByPlaceholderText('Describe the ticket requirements...'), 'Test description')
      await user.selectOptions(screen.getByLabelText(/Priority/), 'high')
      await user.type(screen.getByPlaceholderText('Enter assignee name'), 'john.doe')

      // Click reset button
      await user.click(screen.getByRole('button', { name: /Reset Form/ }))

      // Check that form is reset to initial values
      expect(screen.getByPlaceholderText('Enter ticket title')).toHaveValue('')
      expect(screen.getByPlaceholderText('Describe the ticket requirements...')).toHaveValue('')
      expect(screen.getByLabelText(/Priority/)).toHaveValue('medium')
      expect(screen.getByPlaceholderText('Enter assignee name')).toHaveValue('')
      expect(screen.getByLabelText(/Milestone/)).toHaveValue('')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty milestones list', () => {
      mockUseTickets.mockReturnValue({
        tickets: [],
        milestones: [],
        addTicket: mockAddTicket,
        updateTicket: vi.fn(),
        deleteTicket: vi.fn(),
        moveTicket: vi.fn(),
        addMilestone: vi.fn(),
        updateMilestone: vi.fn(),
      })

      render(<CreateTicket />)
      
      const milestoneSelect = screen.getByLabelText(/Milestone/)
      expect(milestoneSelect).toBeInTheDocument()
      expect(screen.getByText('Select milestone...')).toBeInTheDocument()
    })

    it('handles form submission with only required fields', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Fill only required title field
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Minimal Ticket')
      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(mockAddTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Minimal Ticket',
          description: '',
          priority: 'medium',
          assignee: '',
          milestone: '',
          status: 'todo'
        })
      )
    })

    it('handles form submission with all fields filled', async () => {
      const user = userEvent.setup()
      render(<CreateTicket />)
      
      // Fill all fields
      await user.type(screen.getByPlaceholderText('Enter ticket title'), 'Complete Ticket')
      await user.type(screen.getByPlaceholderText('Describe the ticket requirements...'), 'Full description')
      await user.selectOptions(screen.getByLabelText(/Priority/), 'low')
      await user.type(screen.getByPlaceholderText('Enter assignee name'), 'jane.doe')
      await user.selectOptions(screen.getByLabelText(/Milestone/), 'milestone-2')

      await user.click(screen.getByRole('button', { name: /Create Ticket/ }))

      expect(mockAddTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete Ticket',
          description: 'Full description',
          priority: 'low',
          assignee: 'jane.doe',
          milestone: 'milestone-2',
          status: 'todo'
        })
      )
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<CreateTicket />)
      
      expect(screen.getByLabelText(/Title/)).toBeRequired()
      expect(screen.getByLabelText(/Description/)).not.toBeRequired()
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Assignee/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Milestone/)).toBeInTheDocument()
    })

    it('has proper button roles and accessibility attributes', () => {
      render(<CreateTicket />)
      
      const createButton = screen.getByRole('button', { name: /Create Ticket/ })
      const resetButton = screen.getByRole('button', { name: /Reset Form/ })
      
      expect(createButton).toHaveAttribute('type', 'submit')
      expect(resetButton).toHaveAttribute('type', 'button')
    })
  })
})
