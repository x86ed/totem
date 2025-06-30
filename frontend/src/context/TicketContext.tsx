import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { Ticket, Milestone, TicketContextType } from '../types'

/**
 * Context for managing ticket and milestone data throughout the application
 */
const TicketContext = createContext<TicketContextType | undefined>(undefined)

/**
 * State interface for the ticket reducer
 * @interface TicketState
 */
interface TicketState {
  /** Array of all tickets in the system */
  tickets: Ticket[]
  /** Array of all milestones in the system */
  milestones: Milestone[]
}

/**
 * Union type of all possible actions for the ticket reducer
 * @typedef {Object} TicketAction
 */
type TicketAction =
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'MOVE_TICKET'; payload: { ticketId: string; newStatus: Ticket['status'] } }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }

// Sample data
const initialState: TicketState = {
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

/**
 * Reducer function for managing ticket and milestone state
 * 
 * @param state - Current ticket state containing tickets and milestones arrays
 * @param action - Action object that determines how the state should be updated
 * @returns Updated ticket state
 */
export function ticketReducer(state: TicketState, action: TicketAction): TicketState {
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

interface TicketProviderProps {
  /** React children that will have access to the ticket context */
  children: ReactNode
}

/**
 * Provider component that makes ticket state and actions available to all child components
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to the ticket context
 * @returns Provider component with ticket context
 */
export function TicketProvider({ children }: TicketProviderProps) {
  const [state, dispatch] = useReducer(ticketReducer, initialState)

  /**
   * Adds a new ticket to the system
   * @param ticket - The ticket object to add
   */
  const addTicket = (ticket: Ticket) => {
    dispatch({ type: 'ADD_TICKET', payload: ticket })
  }

  /**
   * Updates an existing ticket
   * @param ticket - The ticket object with updated properties
   */
  const updateTicket = (ticket: Ticket) => {
    dispatch({ type: 'UPDATE_TICKET', payload: ticket })
  }

  /**
   * Deletes a ticket from the system
   * @param ticketId - The ID of the ticket to delete
   */
  const deleteTicket = (ticketId: string) => {
    dispatch({ type: 'DELETE_TICKET', payload: ticketId })
  }

  /**
   * Moves a ticket to a different status column
   * @param ticketId - The ID of the ticket to move
   * @param newStatus - The target status to move the ticket to
   */
  const moveTicket = (ticketId: string, newStatus: Ticket['status']) => {
    dispatch({ type: 'MOVE_TICKET', payload: { ticketId, newStatus } })
  }

  /**
   * Adds a new milestone to the system
   * @param milestone - The milestone object to add
   */
  const addMilestone = (milestone: Milestone) => {
    dispatch({ type: 'ADD_MILESTONE', payload: milestone })
  }

  /**
   * Updates an existing milestone
   * @param milestone - The milestone object with updated properties
   */
  const updateMilestone = (milestone: Milestone) => {
    dispatch({ type: 'UPDATE_MILESTONE', payload: milestone })
  }

  const value: TicketContextType = {
    tickets: state.tickets,
    milestones: state.milestones,
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

/**
 * Custom hook to access the ticket context from any component
 * 
 * @returns Ticket context object containing ticket data and action methods
 * @throws Error if used outside of a TicketProvider
 */
export function useTickets(): TicketContextType {
  const context = useContext(TicketContext)
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}
