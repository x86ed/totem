/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { TicketProvider, useTickets } from "./TicketContext"
import type { Ticket, Milestone } from "../types"

// Test components
const TestComponent = () => {
  const { tickets, milestones } = useTickets()
  return (
    <div>
      <div data-testid="tickets-count">{tickets.length}</div>
      <div data-testid="milestones-count">{milestones.length}</div>
    </div>
  )
}

describe('TicketContext', () => {
  const mockTicket: Ticket = {
    id: 'TKT-TEST',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium',
    assignee: 'test.user',
    milestone: 'v1.0',
    created: '2024-01-01T00:00:00.000Z'
  }

  const mockMilestone: Milestone = {
    id: 'v1.0-test',
    title: 'Version 1.0 Test', 
    description: 'First major release test',
    status: 'planning',
    dueDate: '2024-12-31T23:59:59.000Z'
  }

  it('renders children correctly', () => {
    render(
      <TicketProvider>
        <div data-testid="child">Test Child</div>
      </TicketProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides initial state correctly', () => {
    render(
      <TicketProvider>
        <TestComponent />
      </TicketProvider>
    )
    
    expect(screen.getByTestId('tickets-count')).toBeInTheDocument()
    expect(screen.getByTestId('milestones-count')).toBeInTheDocument()
    
    // Check that initial data is present
    const ticketsCount = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    const milestonesCount = parseInt(screen.getByTestId('milestones-count').textContent || '0')
    
    expect(ticketsCount).toBeGreaterThan(0)
    expect(milestonesCount).toBeGreaterThan(0)
  })

  it('throws error when useTickets is used outside provider', () => {
    const ErrorComponent = () => {
      try {
        useTickets()
        return <div data-testid="no-error">Should not reach here</div>
      } catch (error) {
        return <div data-testid="error">Error caught</div>
      }
    }

    render(<ErrorComponent />)
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('adds tickets correctly', () => {
    const AddTicketTest = () => {
      const { tickets, addTicket } = useTickets()
      
      const handleAdd = () => {
        addTicket(mockTicket)
      }

      return (
        <div>
          <div data-testid="tickets-count">{tickets.length}</div>
          <button data-testid="add-ticket" onClick={handleAdd}>Add Ticket</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <AddTicketTest />
      </TicketProvider>
    )
    
    const initialCount = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('add-ticket').click()
    })
    
    expect(screen.getByTestId('tickets-count')).toHaveTextContent((initialCount + 1).toString())
  })

  it('updates tickets correctly', () => {
    const UpdateTicketTest = () => {
      const { tickets, addTicket, updateTicket } = useTickets()
      const testTicket = tickets.find(t => t.id === mockTicket.id)
      
      const handleAdd = () => {
        addTicket(mockTicket)
      }

      const handleUpdate = () => {
        updateTicket({ ...mockTicket, title: 'Updated Title' })
      }

      return (
        <div>
          <div data-testid="ticket-title">{testTicket?.title || 'No ticket'}</div>
          <button data-testid="add-ticket" onClick={handleAdd}>Add</button>
          <button data-testid="update-ticket" onClick={handleUpdate}>Update</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <UpdateTicketTest />
      </TicketProvider>
    )
    
    act(() => {
      screen.getByTestId('add-ticket').click()
    })
    
    expect(screen.getByTestId('ticket-title')).toHaveTextContent('Test Ticket')
    
    act(() => {
      screen.getByTestId('update-ticket').click()
    })
    
    expect(screen.getByTestId('ticket-title')).toHaveTextContent('Updated Title')
  })

  it('deletes tickets correctly', () => {
    const DeleteTicketTest = () => {
      const { tickets, addTicket, deleteTicket } = useTickets()
      
      const handleAdd = () => {
        addTicket(mockTicket)
      }

      const handleDelete = () => {
        deleteTicket(mockTicket.id)
      }

      return (
        <div>
          <div data-testid="tickets-count">{tickets.length}</div>
          <button data-testid="add-ticket" onClick={handleAdd}>Add</button>
          <button data-testid="delete-ticket" onClick={handleDelete}>Delete</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <DeleteTicketTest />
      </TicketProvider>
    )
    
    const initialCount = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('add-ticket').click()
    })
    
    expect(screen.getByTestId('tickets-count')).toHaveTextContent((initialCount + 1).toString())
    
    act(() => {
      screen.getByTestId('delete-ticket').click()
    })
    
    expect(screen.getByTestId('tickets-count')).toHaveTextContent(initialCount.toString())
  })

  it('moves tickets between statuses correctly', () => {
    const MoveTicketTest = () => {
      const { tickets, addTicket, moveTicket } = useTickets()
      const testTicket = tickets.find(t => t.id === mockTicket.id)
      
      const handleAdd = () => {
        addTicket(mockTicket)
      }

      const handleMove = () => {
        moveTicket(mockTicket.id, 'in-progress')
      }

      return (
        <div>
          <div data-testid="ticket-status">{testTicket?.status || 'No ticket'}</div>
          <button data-testid="add-ticket" onClick={handleAdd}>Add</button>
          <button data-testid="move-ticket" onClick={handleMove}>Move</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <MoveTicketTest />
      </TicketProvider>
    )
    
    act(() => {
      screen.getByTestId('add-ticket').click()
    })
    
    expect(screen.getByTestId('ticket-status')).toHaveTextContent('todo')
    
    act(() => {
      screen.getByTestId('move-ticket').click()
    })
    
    expect(screen.getByTestId('ticket-status')).toHaveTextContent('in-progress')
  })

  it('adds milestones correctly', () => {
    const AddMilestoneTest = () => {
      const { milestones, addMilestone } = useTickets()
      
      const handleAdd = () => {
        addMilestone(mockMilestone)
      }

      return (
        <div>
          <div data-testid="milestones-count">{milestones.length}</div>
          <button data-testid="add-milestone" onClick={handleAdd}>Add Milestone</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <AddMilestoneTest />
      </TicketProvider>
    )
    
    const initialCount = parseInt(screen.getByTestId('milestones-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('add-milestone').click()
    })
    
    expect(screen.getByTestId('milestones-count')).toHaveTextContent((initialCount + 1).toString())
  })

  it('updates milestones correctly', () => {
    const UpdateMilestoneTest = () => {
      const { milestones, addMilestone, updateMilestone } = useTickets()
      const testMilestone = milestones.find(m => m.id === mockMilestone.id)
      
      const handleAdd = () => {
        addMilestone(mockMilestone)
      }

      const handleUpdate = () => {
        updateMilestone({ ...mockMilestone, status: 'active' })
      }

      return (
        <div>
          <div data-testid="milestone-status">{testMilestone?.status || 'No milestone'}</div>
          <button data-testid="add-milestone" onClick={handleAdd}>Add</button>
          <button data-testid="update-milestone" onClick={handleUpdate}>Update</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <UpdateMilestoneTest />
      </TicketProvider>
    )
    
    act(() => {
      screen.getByTestId('add-milestone').click()
    })
    
    expect(screen.getByTestId('milestone-status')).toHaveTextContent('planning')
    
    act(() => {
      screen.getByTestId('update-milestone').click()
    })
    
    expect(screen.getByTestId('milestone-status')).toHaveTextContent('active')
  })

  it('handles edge cases gracefully', () => {
    const EdgeCaseTest = () => {
      const { tickets, updateTicket, deleteTicket, moveTicket, updateMilestone } = useTickets()
      
      const handleUpdate = () => {
        updateTicket({ ...mockTicket, id: 'NON_EXISTENT' })
      }

      const handleDelete = () => {
        deleteTicket('NON_EXISTENT')
      }

      const handleMove = () => {
        moveTicket('NON_EXISTENT', 'done')
      }

      const handleUpdateMilestone = () => {
        updateMilestone({ ...mockMilestone, id: 'NON_EXISTENT' })
      }

      return (
        <div>
          <div data-testid="tickets-count">{tickets.length}</div>
          <button data-testid="update-nonexistent" onClick={handleUpdate}>Update</button>
          <button data-testid="delete-nonexistent" onClick={handleDelete}>Delete</button>
          <button data-testid="move-nonexistent" onClick={handleMove}>Move</button>
          <button data-testid="update-milestone-nonexistent" onClick={handleUpdateMilestone}>Update Milestone</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <EdgeCaseTest />
      </TicketProvider>
    )
    
    const initialCount = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('update-nonexistent').click()
      screen.getByTestId('delete-nonexistent').click()
      screen.getByTestId('move-nonexistent').click()
      screen.getByTestId('update-milestone-nonexistent').click()
    })
    
    expect(screen.getByTestId('tickets-count')).toHaveTextContent(initialCount.toString())
  })

  it('handles all statuses and priorities comprehensively', () => {
    const ComprehensiveTest = () => {
      const { tickets, milestones, addTicket, addMilestone, moveTicket } = useTickets()
      
      const handleTestAll = () => {
        const statuses = ['todo', 'in-progress', 'review', 'done'] as const
        const priorities = ['low', 'medium', 'high'] as const
        const milestoneStatuses = ['planning', 'active', 'completed'] as const
        
        // Test all ticket statuses
        statuses.forEach((status, index) => {
          addTicket({ ...mockTicket, id: `TKT-STATUS-${index}`, status })
        })
        
        // Test all ticket priorities
        priorities.forEach((priority, index) => {
          addTicket({ ...mockTicket, id: `TKT-PRIORITY-${index}`, priority })
        })
        
        // Test all milestone statuses
        milestoneStatuses.forEach((status, index) => {
          addMilestone({ ...mockMilestone, id: `MILE-${index}`, status })
        })
        
        // Test moving tickets
        moveTicket('TKT-STATUS-0', 'done')
        moveTicket('TKT-STATUS-1', 'review')
      }

      return (
        <div>
          <div data-testid="tickets-count">{tickets.length}</div>
          <div data-testid="milestones-count">{milestones.length}</div>
          <button data-testid="test-all" onClick={handleTestAll}>Test All</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <ComprehensiveTest />
      </TicketProvider>
    )
    
    const initialTickets = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    const initialMilestones = parseInt(screen.getByTestId('milestones-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('test-all').click()
    })
    
    // Should have added 4 status tests + 3 priority tests + 3 milestone tests
    expect(parseInt(screen.getByTestId('tickets-count').textContent || '0')).toBe(initialTickets + 7)
    expect(parseInt(screen.getByTestId('milestones-count').textContent || '0')).toBe(initialMilestones + 3)
  })

  it('handles optional fields correctly', () => {
    const minimalTicket: Ticket = {
      id: 'TKT-MINIMAL',
      title: 'Minimal Ticket',
      description: 'Minimal description',
      status: 'todo',
      priority: 'medium',
      created: '2024-01-01T00:00:00.000Z'
    }

    const minimalMilestone: Milestone = {
      id: 'MILE-MINIMAL',
      title: 'Minimal Milestone',
      description: 'Minimal description',
      status: 'planning',
      dueDate: '2024-12-31T23:59:59.000Z'
    }

    const OptionalFieldsTest = () => {
      const { tickets, milestones, addTicket, addMilestone } = useTickets()
      
      const handleAdd = () => {
        addTicket(minimalTicket)
        addMilestone(minimalMilestone)
      }

      const ticket = tickets.find(t => t.id === minimalTicket.id)
      const milestone = milestones.find(m => m.id === minimalMilestone.id)

      return (
        <div>
          <div data-testid="tickets-count">{tickets.length}</div>
          <div data-testid="milestones-count">{milestones.length}</div>
          <div data-testid="ticket-assignee">{ticket?.assignee || 'no assignee'}</div>
          <div data-testid="ticket-milestone">{ticket?.milestone || 'no milestone'}</div>
          <div data-testid="milestone-title">{milestone?.title || 'no milestone'}</div>
          <button data-testid="add-minimal" onClick={handleAdd}>Add Minimal</button>
        </div>
      )
    }

    render(
      <TicketProvider>
        <OptionalFieldsTest />
      </TicketProvider>
    )
    
    const initialTickets = parseInt(screen.getByTestId('tickets-count').textContent || '0')
    const initialMilestones = parseInt(screen.getByTestId('milestones-count').textContent || '0')
    
    act(() => {
      screen.getByTestId('add-minimal').click()
    })
    
    expect(screen.getByTestId('tickets-count')).toHaveTextContent((initialTickets + 1).toString())
    expect(screen.getByTestId('milestones-count')).toHaveTextContent((initialMilestones + 1).toString())
    expect(screen.getByTestId('ticket-assignee')).toHaveTextContent('no assignee')
    expect(screen.getByTestId('ticket-milestone')).toHaveTextContent('no milestone')
    expect(screen.getByTestId('milestone-title')).toHaveTextContent('Minimal Milestone')
  })
})