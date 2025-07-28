import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react'
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

// Initial state is empty; all data is loaded from the ticket API
const initialState: TicketState = {
  tickets: [],
  milestones: [],
  loading: false,
  error: null
}

// Pagination and filter types

export { TicketContext };
export interface TicketPagination {
  offset: number;
  limit: number;
  total: number;
  totalFiltered: number;
}

export interface TicketFilters {
  id?: string;
  status?: string;
  priority?: string;
  complexity?: string;
  persona?: string;
  contributor?: string;
}

export interface TicketSort {
  field: string;
  order: 'asc' | 'desc';
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
  const [state, dispatch] = useReducer(ticketReducer, initialState);
  const [pagination, setPagination] = useState<TicketPagination>({ offset: 0, limit: 20, total: 0, totalFiltered: 0 });
  const [filters, setFilters] = useState<TicketFilters>({});
  const [sort, setSort] = useState<TicketSort>({ field: 'id', order: 'asc' });

  // Load tickets when the provider mounts
  useEffect(() => {
    refreshTickets({ offset: 0, limit: 20, filters: {}, sort: { field: 'id', order: 'asc' } });
    // eslint-disable-next-line
  }, []);

  /**
   * Loads all tickets from the API in batches and sets them in state
   * @param batchSize - Number of tickets to fetch per request (default 100)
   * @param filtersOverride - Optional filters to use
   * @param sortOverride - Optional sort to use
   */
  const loadAllTickets = async (
    filtersOverride?: TicketFilters,
    sortOverride?: TicketSort
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const f = filtersOverride ?? filters;
      const s = sortOverride ?? sort;
      const limit = 20;
      let offset = 0;
      let total = 0;
      let allTickets: Ticket[] = [];

      // First request to get total
      const query = new URLSearchParams();
      query.append('offset', String(offset));
      query.append('limit', String(limit));
      if (f.id) query.append('id', f.id);
      if (f.status) query.append('status', f.status);
      if (f.priority) query.append('priority', f.priority);
      if (f.complexity) query.append('complexity', f.complexity);
      if (f.persona) query.append('persona', f.persona);
      if (f.contributor) query.append('contributor', f.contributor);
      if (s.field) query.append('sortBy', s.field);
      if (s.order) query.append('sortOrder', s.order);
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/ticket?${query}` : `/api/ticket?${query}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
      const data = await response.json();
      const tickets = data.tickets || [];
      total = data.pagination?.total ?? tickets.length;
      allTickets = allTickets.concat(tickets);
      offset += limit;

      // Fetch remaining pages if needed
      while (allTickets.length < total) {
        const pageQuery = new URLSearchParams();
        pageQuery.append('offset', String(offset));
        pageQuery.append('limit', String(limit));
        if (f.id) pageQuery.append('id', f.id);
        if (f.status) pageQuery.append('status', f.status);
        if (f.priority) pageQuery.append('priority', f.priority);
        if (f.complexity) pageQuery.append('complexity', f.complexity);
        if (f.persona) pageQuery.append('persona', f.persona);
        if (f.contributor) pageQuery.append('contributor', f.contributor);
        if (s.field) pageQuery.append('sortBy', s.field);
        if (s.order) pageQuery.append('sortOrder', s.order);
        const pageUrl = import.meta.env?.DEV ? `http://localhost:8080/api/ticket?${pageQuery}` : `/api/ticket?${pageQuery}`;
        const pageResponse = await fetch(pageUrl);
        if (!pageResponse.ok) {
          throw new Error(`Failed to fetch tickets: ${pageResponse.status}`);
        }
        const pageData = await pageResponse.json();
        const pageTickets = pageData.tickets || [];
        allTickets = allTickets.concat(pageTickets);
        offset += limit;
      }

      dispatch({ type: 'SET_TICKETS', payload: allTickets });
      setPagination(prev => ({ ...prev, total: allTickets.length, totalFiltered: allTickets.length, offset: 0, limit: allTickets.length }));
      setFilters(f);
      setSort(s);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load all tickets' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Refreshes tickets from the API with optional pagination, filters, and sort
   */
  const refreshTickets = async (params?: {
    offset?: number;
    limit?: number;
    filters?: TicketFilters;
    sort?: TicketSort;
  }): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const offset = params?.offset ?? pagination.offset;
      const limit = params?.limit ?? pagination.limit;
      const f = params?.filters ?? filters;
      const s = params?.sort ?? sort;

      // Build query string
      const query = new URLSearchParams();
      query.append('offset', String(offset));
      query.append('limit', String(limit));
      if (f.id) query.append('id', f.id);
      if (f.status) query.append('status', f.status);
      if (f.priority) query.append('priority', f.priority);
      if (f.complexity) query.append('complexity', f.complexity);
      if (f.persona) query.append('persona', f.persona);
      if (f.contributor) query.append('contributor', f.contributor);
      if (s.field) query.append('sortBy', s.field);
      if (s.order) query.append('sortOrder', s.order);

      // Use relative URL in production, absolute URL in development
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/ticket?${query}` : `/api/ticket?${query}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = await response.json();
      const tickets = data.tickets || [];
      const pag = data.pagination || { offset, limit, total: tickets.length, totalFiltered: tickets.length };

      dispatch({ type: 'SET_TICKETS', payload: tickets });
      setPagination(pag);
      setFilters(f);
      setSort(s);
      // Optionally, add a SET_MILESTONES action if you want to manage milestones from API
      // dispatch({ type: 'SET_MILESTONES', payload: milestones });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh tickets' });
    }
  };

  /**
   * Creates a new ticket
   * @param ticket - The ticket object to create
   */
  const createTicket = async (ticket: Partial<Ticket>): Promise<void> => {
    console.log('Creating ticket:', ticket)
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Use relative URL in production, absolute URL in development
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/ticket` : `/api/ticket`;
      const ticketString = JSON.stringify(ticket);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ticketString
      });
      if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.status}`);
      }

      // Get the created ticket from backend response
      const data = await response.json();
      const createdTicket = data.ticket || ticket;
      dispatch({ type: 'ADD_TICKET', payload: createdTicket })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create ticket' })
    }
  }

  /**
   * Updates an existing ticket
   * @param ticket - The ticket object with updated properties
   */
  /**
   * Updates an existing ticket and persists changes to the backend
   * @param ticket - The ticket object with updated properties
   */
  const updateTicket = async (ticket: Ticket): Promise<void> => {
    console.log('[DEBUG] Updating ticket (input):', ticket)
    console.log('[DEBUG] Description before stringify:', ticket.description)
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Use relative URL in production, absolute URL in development
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/ticket/${ticket.id}` : `/api/ticket/${ticket.id}`;
      const ticketString = JSON.stringify(ticket)
      console.log('[DEBUG] JSON.stringify(ticket):', ticketString)
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ticketString
      });
      if (!response.ok) {
        throw new Error(`Failed to update ticket: ${response.status}`);
      }

      // Get the updated ticket from backend response
      const data = await response.json();
      const updatedTicket = data.ticket || ticket;
      dispatch({ type: 'UPDATE_TICKET', payload: updatedTicket })
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
    deleteTicket,
    pagination,
    setPagination,
    filters,
    setFilters,
    sort,
    setSort,
    loadAllTickets, // Expose the new function
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
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
