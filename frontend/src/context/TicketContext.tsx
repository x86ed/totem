import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
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
  /** Loading state for async operations */
  loading: boolean
  /** Error message if any operations failed */
  error: string | null
}

/**
 * Union type of all possible actions for the ticket reducer
 * @typedef {Object} TicketAction
 */
type TicketAction =
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }

// Initial state with empty data - will be populated from API
const initialState: TicketState = {
  tickets: [],
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
  ],
  loading: false,
  error: null
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
    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload,
        loading: false,
        error: null
      }
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
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
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

  // Load tickets when the provider mounts
  useEffect(() => {
    refreshTickets()
  }, [])

  /**
   * Refreshes tickets from the API
   */
  const refreshTickets = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Use relative URL in production, absolute URL in development
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/ticket' : '/api/ticket'
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`)
      }
      
      const data = await response.json()
      const tickets = data.tickets || []
      
      dispatch({ type: 'SET_TICKETS', payload: tickets })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh tickets' })
    }
  }

  /**
   * Creates a new ticket
   * @param ticket - The ticket object to create
   */
  const createTicket = async (ticket: Partial<Ticket>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Generate a new ticket with default values
      const newTicket: Ticket = {
        id: ticket.id || `TKT-${Date.now()}`,
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        complexity: ticket.complexity || 'medium',
        persona: ticket.persona || undefined,
        contributor: ticket.contributor || undefined,
        assignee: ticket.assignee || undefined,
        acceptance_criteria: ticket.acceptance_criteria || undefined,
        milestone: ticket.milestone || undefined,
        created: ticket.created || new Date().toISOString(),
        blocks: ticket.blocks || [],
        blocked_by: ticket.blocked_by || []
      }
      
      dispatch({ type: 'ADD_TICKET', payload: newTicket })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create ticket' })
    }
  }

  /**
   * Updates an existing ticket
   * @param ticket - The ticket object with updated properties
   */
  const updateTicket = async (ticket: Ticket): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      dispatch({ type: 'UPDATE_TICKET', payload: ticket })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update ticket' })
    }
  }

  /**
   * Deletes a ticket from the system
   * @param ticketId - The ID of the ticket to delete
   */
  const deleteTicket = async (ticketId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      dispatch({ type: 'DELETE_TICKET', payload: ticketId })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete ticket' })
    }
  }

  /**
   * Adds a new milestone to the system
   * @param milestone - The milestone object to add
   */
  // const addMilestone = async (milestone: Milestone): Promise<void> => {
  //   try {
  //     dispatch({ type: 'ADD_MILESTONE', payload: milestone })
  //   } catch (error) {
  //     dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add milestone' })
  //   }
  // }

  /**
   * Updates an existing milestone
   * @param milestone - The milestone object with updated properties
   */
  // const updateMilestone = async (milestone: Milestone): Promise<void> => {
  //   try {
  //     dispatch({ type: 'UPDATE_MILESTONE', payload: milestone })
  //   } catch (error) {
  //     dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update milestone' })
  //   }
  // }

  /**
   * Adds a new ticket to the system (alias for createTicket)
   * @param ticket - Partial ticket data to add
   */
  const addTicket = async (ticket: Partial<Ticket>): Promise<void> => {
    await createTicket(ticket)
  }

  const value: TicketContextType = {
    tickets: state.tickets,
    milestones: state.milestones,
    loading: state.loading,
    error: state.error,
    refreshTickets,
    addTicket,
    createTicket,
    updateTicket,
    deleteTicket
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
