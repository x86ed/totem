import React, { createContext, useContext, useReducer } from 'react'

const TicketContext = createContext()

// Sample data
const initialState = {
  tickets: [
    {
      id: 'TKT-001',
      title: 'Fix user authentication bug',
      description: 'Users are experiencing issues with login validation. The system should properly validate credentials and show appropriate error messages.',
      status: 'todo',
      priority: 'high',
      assignee: 'john.doe',
      milestone: 'v1.0',
      created: '2025-06-26'
    },
    {
      id: 'TKT-002',
      title: 'Implement dark mode',
      description: 'Add dark mode toggle to improve user experience during low-light conditions.',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'jane.smith',
      milestone: 'v1.1',
      created: '2025-06-25'
    },
    {
      id: 'TKT-003',
      title: 'Add export functionality',
      description: 'Allow users to export their data in multiple formats including JSON and CSV.',
      status: 'review',
      priority: 'low',
      assignee: 'bob.wilson',
      milestone: 'v1.0',
      created: '2025-06-24'
    },
    {
      id: 'TKT-004',
      title: 'Database optimization',
      description: 'Optimize database queries to improve application performance.',
      status: 'done',
      priority: 'high',
      assignee: 'alice.brown',
      milestone: 'v0.9',
      created: '2025-06-20'
    }
  ],
  milestones: [
    {
      id: 'v0.9',
      title: 'Beta Release',
      description: 'Initial beta version with core features',
      dueDate: '2025-06-30',
      status: 'completed'
    },
    {
      id: 'v1.0',
      title: 'Production Release',
      description: 'First stable release with all essential features',
      dueDate: '2025-07-15',
      status: 'active'
    },
    {
      id: 'v1.1',
      title: 'Enhanced Features',
      description: 'Additional features and improvements',
      dueDate: '2025-08-01',
      status: 'planning'
    }
  ]
}

function ticketReducer(state, action) {
  switch (action.type) {
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [...state.tickets, action.payload]
      }
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? { ...ticket, ...action.payload } : ticket
        )
      }
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter(ticket => ticket.id !== action.payload)
      }
    case 'MOVE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.ticketId
            ? { ...ticket, status: action.payload.newStatus }
            : ticket
        )
      }
    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...state.milestones, action.payload]
      }
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map(milestone =>
          milestone.id === action.payload.id ? { ...milestone, ...action.payload } : milestone
        )
      }
    default:
      return state
  }
}

export function TicketProvider({ children }) {
  const [state, dispatch] = useReducer(ticketReducer, initialState)

  const addTicket = (ticket) => {
    dispatch({ type: 'ADD_TICKET', payload: ticket })
  }

  const updateTicket = (ticket) => {
    dispatch({ type: 'UPDATE_TICKET', payload: ticket })
  }

  const deleteTicket = (ticketId) => {
    dispatch({ type: 'DELETE_TICKET', payload: ticketId })
  }

  const moveTicket = (ticketId, newStatus) => {
    dispatch({ type: 'MOVE_TICKET', payload: { ticketId, newStatus } })
  }

  const addMilestone = (milestone) => {
    dispatch({ type: 'ADD_MILESTONE', payload: milestone })
  }

  const updateMilestone = (milestone) => {
    dispatch({ type: 'UPDATE_MILESTONE', payload: milestone })
  }

  const value = {
    ...state,
    addTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
    addMilestone,
    updateMilestone
  }

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  )
}

export function useTickets() {
  const context = useContext(TicketContext)
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}