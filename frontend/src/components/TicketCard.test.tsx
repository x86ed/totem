/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import TicketCard from "./TicketCard.tsx"
import { Ticket } from "../types"

describe('TicketCard', () => {
  const baseTicket: Ticket = {
    id: 'TKT-001',
    title: 'Test Ticket Title',
    description: 'This is a test ticket description.',
    status: 'todo',
    priority: 'medium',
    assignee: 'john.doe',
    milestone: 'v1.0',
    created: '2024-01-01T00:00:00.000Z'
  }

  describe('Basic rendering', () => {
    it('renders ticket card with all basic information', () => {
      render(<TicketCard ticket={baseTicket} />)
      
      expect(screen.getByText('🎫')).toBeInTheDocument()
      expect(screen.getByText('TKT-001')).toBeInTheDocument()
      expect(screen.getByText('Test Ticket Title')).toBeInTheDocument()
      expect(screen.getByText('This is a test ticket description.')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      expect(screen.getByText('john.doe')).toBeInTheDocument()
    })

    it('renders without optional assignee', () => {
      const ticketWithoutAssignee: Ticket = {
        ...baseTicket,
        assignee: undefined
      }
      
      render(<TicketCard ticket={ticketWithoutAssignee} />)
      
      expect(screen.getByText('TKT-001')).toBeInTheDocument()
      expect(screen.queryByText('👤')).not.toBeInTheDocument()
      expect(screen.queryByText('john.doe')).not.toBeInTheDocument()
    })
  })

  describe('Priority handling', () => {
    it('displays high priority correctly', () => {
      const highPriorityTicket: Ticket = {
        ...baseTicket,
        priority: 'high'
      }
      
      render(<TicketCard ticket={highPriorityTicket} />)
      
      expect(screen.getByText('🔥')).toBeInTheDocument()
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      
      const priorityElement = screen.getByText('HIGH').closest('span')
      expect(priorityElement).toHaveClass('priority-high-green')
    })

    it('displays medium priority correctly', () => {
      render(<TicketCard ticket={baseTicket} />)
      
      expect(screen.getByText('⚡')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      
      const priorityElement = screen.getByText('MEDIUM').closest('span')
      expect(priorityElement).toHaveClass('priority-medium-green')
    })

    it('displays low priority correctly', () => {
      const lowPriorityTicket: Ticket = {
        ...baseTicket,
        priority: 'low'
      }
      
      render(<TicketCard ticket={lowPriorityTicket} />)
      
      expect(screen.getByText('🟢')).toBeInTheDocument()
      expect(screen.getByText('LOW')).toBeInTheDocument()
      
      const priorityElement = screen.getByText('LOW').closest('span')
      expect(priorityElement).toHaveClass('priority-low-green')
    })
  })

  describe('Assignee handling', () => {
    it('displays assignee with correct icon and styling', () => {
      render(<TicketCard ticket={baseTicket} />)
      
      expect(screen.getByText('👤')).toBeInTheDocument()
      expect(screen.getByText('john.doe')).toBeInTheDocument()
      
      const assigneeElement = screen.getByText('john.doe').closest('span')
      expect(assigneeElement).toHaveClass('assignee-green')
    })

    it('handles empty assignee string', () => {
      const ticketWithEmptyAssignee: Ticket = {
        ...baseTicket,
        assignee: ''
      }
      
      render(<TicketCard ticket={ticketWithEmptyAssignee} />)
      
      expect(screen.queryByText('👤')).not.toBeInTheDocument()
    })
  })

  describe('Content styling', () => {
    it('applies correct CSS classes to elements', () => {
      const { container } = render(<TicketCard ticket={baseTicket} />)
      
      expect(container.querySelector('.ticket-green')).toBeInTheDocument()
      expect(container.querySelector('.ticket-title.line-clamp-2')).toBeInTheDocument()
      expect(container.querySelector('.ticket-description.line-clamp-3')).toBeInTheDocument()
      expect(container.querySelector('.ticket-meta')).toBeInTheDocument()
    })

    it('handles long title text with proper truncation class', () => {
      const longTitleTicket: Ticket = {
        ...baseTicket,
        title: 'This is an extremely long title that should be truncated'
      }
      
      render(<TicketCard ticket={longTitleTicket} />)
      
      const titleElement = screen.getByText(longTitleTicket.title)
      expect(titleElement).toHaveClass('line-clamp-2')
      expect(titleElement.tagName).toBe('H4')
    })

    it('handles long description with proper truncation class', () => {
      const longDescTicket: Ticket = {
        ...baseTicket,
        description: 'This is a very long description that should be truncated properly to maintain layout consistency'
      }
      
      render(<TicketCard ticket={longDescTicket} />)
      
      const descElement = screen.getByText(longDescTicket.description)
      expect(descElement).toHaveClass('line-clamp-3')
      expect(descElement.tagName).toBe('P')
    })
  })

  describe('Edge cases', () => {
    it('handles minimal ticket data', () => {
      const minimalTicket: Ticket = {
        id: 'TKT-MIN',
        title: 'Minimal',
        description: 'Min desc',
        status: 'todo',
        priority: 'low',
        created: '2024-01-01T00:00:00.000Z'
      }
      
      render(<TicketCard ticket={minimalTicket} />)
      
      expect(screen.getByText('TKT-MIN')).toBeInTheDocument()
      expect(screen.getByText('Minimal')).toBeInTheDocument()
      expect(screen.getByText('LOW')).toBeInTheDocument()
      expect(screen.queryByText('👤')).not.toBeInTheDocument()
    })

    it('handles special characters in content', () => {
      const specialTicket: Ticket = {
        ...baseTicket,
        id: 'TKT-SPECIAL',
        title: 'Title with émojis 🎉',
        description: 'Description with spéciál characters',
        assignee: 'user@domain.com'
      }
      
      render(<TicketCard ticket={specialTicket} />)
      
      expect(screen.getByText('TKT-SPECIAL')).toBeInTheDocument()
      expect(screen.getByText('Title with émojis 🎉')).toBeInTheDocument()
      expect(screen.getByText('Description with spéciál characters')).toBeInTheDocument()
      expect(screen.getByText('user@domain.com')).toBeInTheDocument()
    })

    it('handles all priority types correctly', () => {
      const priorities: Array<Ticket['priority']> = ['low', 'medium', 'high']
      const expectedIcons = { low: '🟢', medium: '⚡', high: '🔥' }
      const expectedClasses = { 
        low: 'priority-low-green',
        medium: 'priority-medium-green', 
        high: 'priority-high-green' 
      }

      priorities.forEach(priority => {
        const ticket: Ticket = { ...baseTicket, priority }
        const { unmount } = render(<TicketCard ticket={ticket} />)
        
        expect(screen.getByText(expectedIcons[priority])).toBeInTheDocument()
        expect(screen.getByText(priority.toUpperCase())).toBeInTheDocument()
        
        const priorityElement = screen.getByText(priority.toUpperCase()).closest('span')
        expect(priorityElement).toHaveClass(expectedClasses[priority])
        
        unmount()
      })
    })
  })
})
