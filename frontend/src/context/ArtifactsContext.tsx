import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'

// Types for artifact tree and file
export interface ArtifactNode {
  name: string
  path: string
  type: 'file' | 'folder' | 'directory'
  children?: ArtifactNode[]
}

export interface ArtifactFile {
  content: string
  encoding?: string
  mime?: string
}

export interface ArtifactsContextType {
  tree: ArtifactNode | null
  loading: boolean
  error: string | null
  refreshTree: () => Promise<void>
  getFile: (path: string) => Promise<ArtifactFile | null>
  saveFile: (path: string, content: string, encoding?: 'utf-8' | 'base64') => Promise<void>
  createFolder: (path: string) => Promise<void>
}

const ArtifactsContext = createContext<ArtifactsContextType | undefined>(undefined)

interface ArtifactsState {
  tree: ArtifactNode | null
  loading: boolean
  error: string | null
}

type ArtifactsAction =
  | { type: 'SET_TREE'; payload: ArtifactNode | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: ArtifactsState = {
  tree: null,
  loading: false,
  error: null
}

function artifactsReducer(state: ArtifactsState, action: ArtifactsAction): ArtifactsState {
  switch (action.type) {
    case 'SET_TREE':
      return { ...state, tree: action.payload, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface ArtifactsProviderProps {
  children: ReactNode
}

export function ArtifactsProvider({ children }: ArtifactsProviderProps) {
  const [state, dispatch] = useReducer(artifactsReducer, initialState)

  // Fetch the artifacts directory tree
  const refreshTree = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/artifacts/tree' : '/api/artifacts/tree'
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`Failed to fetch artifacts tree: ${response.status}`)
      const data = await response.json()
      dispatch({ type: 'SET_TREE', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch artifacts tree' })
    }
  }, [])

  // Get a file's content
  const getFile = useCallback(async (path: string): Promise<ArtifactFile | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = (import.meta.env?.DEV ? 'http://localhost:8080' : '') + `/api/artifacts/file?path=${encodeURIComponent(path)}`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`)
      const data = await response.json()
      dispatch({ type: 'SET_LOADING', payload: false })
      return data
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch file' })
      return null
    }
  }, [])

  // Save a file (create or update)
  const saveFile = useCallback(async (path: string, content: string, encoding: 'utf-8' | 'base64' = 'utf-8') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/artifacts/file' : '/api/artifacts/file'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content, encoding })
      })
      if (!response.ok) throw new Error(`Failed to save file: ${response.status}`)
      dispatch({ type: 'SET_LOADING', payload: false })
      await refreshTree()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save file' })
    }
  }, [refreshTree])

  // Create a new folder
  const createFolder = useCallback(async (path: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/artifacts/folder' : '/api/artifacts/folder'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })
      if (!response.ok) throw new Error(`Failed to create folder: ${response.status}`)
      dispatch({ type: 'SET_LOADING', payload: false })
      await refreshTree()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create folder' })
    }
  }, [refreshTree])

  // Load tree on mount
  useEffect(() => {
    refreshTree()
  }, [refreshTree])

  const value: ArtifactsContextType = {
    tree: state.tree,
    loading: state.loading,
    error: state.error,
    refreshTree,
    getFile,
    saveFile,
    createFolder
  }

  return (
    <ArtifactsContext.Provider value={value}>
      {children}
    </ArtifactsContext.Provider>
  )
}

export function useArtifacts(): ArtifactsContextType {
  const context = useContext(ArtifactsContext)
  if (context === undefined) {
    throw new Error('useArtifacts must be used within an ArtifactsProvider')
  }
  return context
}
