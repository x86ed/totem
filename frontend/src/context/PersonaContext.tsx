import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { Persona, PersonaContextType } from '../types'

/**
 * Context for managing persona data throughout the application
 */
const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

/**
 * State interface for the persona reducer
 */
interface PersonaState {
  personas: Persona[]
  loading: boolean
  error: string | null
}

/**
 * Union type of all possible actions for the persona reducer
 */
type PersonaAction =
  | { type: 'SET_PERSONAS'; payload: Persona[] }
  | { type: 'ADD_PERSONA'; payload: Persona }
  | { type: 'UPDATE_PERSONA'; payload: Persona }
  | { type: 'DELETE_PERSONA'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: PersonaState = {
  personas: [],
  loading: false,
  error: null
}

/**
 * Reducer function for managing persona state
 */
export function personaReducer(state: PersonaState, action: PersonaAction): PersonaState {
  switch (action.type) {
    case 'SET_PERSONAS':
      return { ...state, personas: action.payload, loading: false, error: null }
    case 'ADD_PERSONA':
      return { ...state, personas: [...state.personas, action.payload] }
    case 'UPDATE_PERSONA':
      return {
        ...state,
        personas: state.personas.map(persona =>
          persona.name === action.payload.name ? { ...persona, ...action.payload } : persona
        )
      }
    case 'DELETE_PERSONA':
      return {
        ...state,
        personas: state.personas.filter(persona => persona.name !== action.payload)
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface PersonaProviderProps {
  children: ReactNode
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const [state, dispatch] = useReducer(personaReducer, initialState)

  useEffect(() => {
    refreshPersonas()
  }, [])

  /**
   * Refreshes personas from the API
   */
  const refreshPersonas = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/persona' : '/api/persona'
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch personas: ${response.status}`)
      }
      const data = await response.json()
      // API returns an array of personas
      dispatch({ type: 'SET_PERSONAS', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh personas' })
    }
  }

  /**
   * Creates a new persona
   */
  const createPersona = async (persona: Partial<Persona>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/persona' : '/api/persona'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      })
      if (!response.ok) {
        throw new Error(`Failed to create persona: ${response.status}`)
      }
      const newPersona = await response.json()
      dispatch({ type: 'ADD_PERSONA', payload: newPersona })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create persona' })
    }
  }

  /**
   * Updates an existing persona
   */
  const updatePersona = async (name: string, persona: Persona): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/persona/${name}` : `/api/persona/${name}`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      })
      if (!response.ok) {
        throw new Error(`Failed to update persona: ${response.status}`)
      }
      const updatedPersona = await response.json()
      dispatch({ type: 'UPDATE_PERSONA', payload: updatedPersona })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update persona' })
    }
  }

  /**
   * Deletes a persona
   */
  const deletePersona = async (name: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/persona/${name}` : `/api/persona/${name}`
      const response = await fetch(apiUrl, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`Failed to delete persona: ${response.status}`)
      }
      dispatch({ type: 'DELETE_PERSONA', payload: name })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete persona' })
    }
  }

  const value: PersonaContextType = {
    personas: state.personas,
    loading: state.loading,
    error: state.error,
    refreshPersonas,
    createPersona,
    updatePersona,
    deletePersona
  }

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  )
}

/**
 * Custom hook to access the persona context from any component
 */
export function usePersonas(): PersonaContextType {
  const context = useContext(PersonaContext)
  if (context === undefined) {
    throw new Error('usePersonas must be used within a PersonaProvider')
  }
  return context
}
