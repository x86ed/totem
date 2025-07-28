import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

/**
 * Context for managing contributor data throughout the application
 */
const ContributorContext = createContext<ContributorContextType | undefined>(undefined);

interface ContributorState {
  contributors: Contributor[];
  loading: boolean;
  error: string | null;
}

type ContributorAction =
  | { type: 'SET_CONTRIBUTORS'; payload: Contributor[] }
  | { type: 'ADD_CONTRIBUTOR'; payload: Contributor }
  | { type: 'UPDATE_CONTRIBUTOR'; payload: Contributor }
  | { type: 'DELETE_CONTRIBUTOR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ContributorState = {
  contributors: [],
  loading: false,
  error: null,
};

export function contributorReducer(state: ContributorState, action: ContributorAction): ContributorState {
  switch (action.type) {
    case 'SET_CONTRIBUTORS':
      return { ...state, contributors: action.payload, loading: false, error: null };
    case 'ADD_CONTRIBUTOR':
      return { ...state, contributors: [...state.contributors, action.payload] };
    case 'UPDATE_CONTRIBUTOR':
      return {
        ...state,
        contributors: state.contributors.map(contributor =>
          contributor.name === action.payload.name ? { ...contributor, ...action.payload } : contributor
        ),
      };
    case 'DELETE_CONTRIBUTOR':
      return {
        ...state,
        contributors: state.contributors.filter(contributor => contributor.name !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface ContributorProviderProps {
  children: ReactNode;
}

export function ContributorProvider({ children }: ContributorProviderProps) {
  const [state, dispatch] = useReducer(contributorReducer, initialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.resolve(refreshContributors()).catch(() => {});
  }, []);

  /**
   * Refreshes contributors from the API
   */
  const refreshContributors = async (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/contributor' : '/api/contributor';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch contributors: ${response.status}`);
      }
      const data = await response.json();
      dispatch({ type: 'SET_CONTRIBUTORS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh contributors' });
    }
  };

  /**
   * Creates a new contributor
   */
  const createContributor = async (contributor: Partial<Contributor>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const apiUrl = import.meta.env?.DEV ? 'http://localhost:8080/api/contributor' : '/api/contributor';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributor),
      });
      if (!response.ok) {
        throw new Error(`Failed to create contributor: ${response.status}`);
      }
      const newContributor = await response.json();
      dispatch({ type: 'ADD_CONTRIBUTOR', payload: newContributor });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create contributor' });
    }
  };

  /**
   * Updates an existing contributor
   */
  const updateContributor = async (name: string, contributor: Contributor): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/contributor/${name}` : `/api/contributor/${name}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributor),
      });
      if (!response.ok) {
        throw new Error(`Failed to update contributor: ${response.status}`);
      }
      const updatedContributor = await response.json();
      dispatch({ type: 'UPDATE_CONTRIBUTOR', payload: updatedContributor });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update contributor' });
    }
  };

  /**
   * Deletes a contributor
   */
  const deleteContributor = async (name: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const apiUrl = import.meta.env?.DEV ? `http://localhost:8080/api/contributor/${name}` : `/api/contributor/${name}`;
      const response = await fetch(apiUrl, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete contributor: ${response.status}`);
      }
      dispatch({ type: 'DELETE_CONTRIBUTOR', payload: name });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete contributor' });
    }
  };

  const value: ContributorContextType = {
    contributors: state.contributors,
    loading: state.loading,
    error: state.error,
    refreshContributors,
    createContributor,
    updateContributor,
    deleteContributor,
  };

  return (
    <ContributorContext.Provider value={value}>
      {children}
    </ContributorContext.Provider>
  );
}

/**
 * Custom hook to access the contributor context from any component
 */
export function useContributors(): ContributorContextType {
  const context = useContext(ContributorContext);
  if (context === undefined) {
    throw new Error('useContributors must be used within a ContributorProvider');
  }
  return context;
}

/**
 * ContributorContextType interface
 */
export interface ContributorContextType {
  contributors: Contributor[];
  loading: boolean;
  error: string | null;
  refreshContributors: () => Promise<void>;
  createContributor: (contributor: Partial<Contributor>) => Promise<void>;
  updateContributor: (name: string, contributor: Contributor) => Promise<void>;
  deleteContributor: (name: string) => Promise<void>;
}

/**
 * Contributor interface
 */
export interface Contributor {
  name: string;
  gitProfile?: {
    username?: string;
    fullName?: string;
    email?: string;
    github?: string;
    location?: string;
    joined?: string;
  };
  roleAndResponsibilities?: {
    position?: string;
    team?: string;
    focusAreas?: string[];
  };
  availability?: {
    primaryTimezone?: string;
    workingHours?: string;
    bestContactTime?: string;
    responseTime?: string;
  };
  codingPreferences?: {
    primary?: string[];
    frontend?: string;
    backend?: string;
    databases?: string;
    tools?: string;
  };
  codeStyle?: {
    formatting?: string;
    linting?: string;
    testing?: string;
    documentation?: string;
  };
  workflow?: {
    branching?: string;
    commits?: string;
    prProcess?: string;
    codeReview?: string;
  };
  communication?: {
    codeReviews?: string;
    documentation?: string;
    meetings?: string;
    mentoring?: string;
  };
  expertise?: {
    expertiseAreas?: string[];
  };
  funFacts?: {
    funFacts?: string[];
  };
  contactPreferences?: {
    urgentIssues?: string;
    codeQuestions?: string;
    generalDiscussion?: string;
    afterHours?: string;
  };
  lastUpdated?: string;
}
