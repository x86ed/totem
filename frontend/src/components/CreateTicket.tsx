import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useTickets } from '../context/TicketContext'
import TicketMarkdownView from './TicketMarkdownView'
import MilkdownEditor from './MilkdownEditor'

/**
 * API Ticket interface matching the backend DTO structure
 * @interface ApiTicket
 */
interface ApiTicket {
  id?: string
  title: string
  description: string
  status?: 'open' | 'in_progress' | 'closed' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  complexity?: 'low' | 'medium' | 'high'
  persona?: string
  contributor?: string
  model?: string
  effort_days?: number
  blocks?: string[]
  blocked_by?: string[]
  acceptance_criteria?: Array<{ criteria: string; complete: boolean }>
  tags?: string[]
  notes?: string
  risks?: string[]
  resources?: string[]
}

/**
 * Form data interface for creating/editing a ticket
 * @interface FormData
 */
interface FormData {
  /** The title of the ticket (required) */
  title: string
  /** Optional description providing details about the ticket */
  description: string
  /** Status of the ticket */
  status: 'open' | 'in_progress' | 'closed' | 'blocked'
  /** Priority level of the ticket */
  priority: 'low' | 'medium' | 'high' | 'critical'
  /** Complexity level of the ticket */
  complexity: 'low' | 'medium' | 'high'
  /** Target persona for this ticket */
  persona: string
  /** Contributor assigned to this ticket */
  contributor: string
  /** AI model associated with this ticket */
  model: string
  /** Estimated effort in days */
  effort_days: number | ''
  /** List of ticket IDs that this ticket blocks */
  blocks: string[]
  /** List of ticket IDs that block this ticket */
  blocked_by: string[]
  /** Acceptance criteria */
  acceptance_criteria: string
  /** Tags associated with the ticket */
  tags: string
  /** Additional notes for the ticket */
  notes: string
  /** Identified risks for this ticket */
  risks: string
  /** Resources and links related to the ticket */
  resources: string
}

/**
 * CreateTicket Component Props
 * @interface CreateTicketProps
 */
interface CreateTicketProps {
  /** The mode of the ticket component */
  mode?: 'create' | 'edit' | 'view'
  /** The ticket ID for edit/view modes */
  ticketId?: string | null
  /** Navigation callback for mode changes */
  onNavigate?: (mode: 'create' | 'edit' | 'view', id?: string) => void
}

/**
 * CreateTicket Component
 * 
 * A form component for creating, editing, and viewing tickets in the project management system.
 * Provides fields for all ticket properties including title, description, priority,
 * complexity, persona, contributor, acceptance criteria, and more.
 * 
 * Features:
 * - Form validation (title is required)
 * - Create new tickets, edit existing ones, or view in read-only mode
 * - API integration with backend ticket service
 * - Success/error message display
 * - Form reset functionality
 * - Accessible form labels and structure
 * - Deep linking support
 * 
 * @component
 * @returns {JSX.Element} The CreateTicket form component
 * 
 * @example
 * ```tsx
 * // Create new ticket
 * <CreateTicket mode="create" />
 * 
 * // Edit existing ticket
 * <CreateTicket mode="edit" ticketId="ticket-123" />
 * 
 * // View ticket (read-only)
 * <CreateTicket mode="view" ticketId="ticket-123" />
 * ```
 */
const CreateTicket: React.FC<CreateTicketProps> = ({ 
  mode = 'create', 
  ticketId = null, 
  onNavigate 
}) => {
  // Get tickets from context for blocks/blocked_by dropdowns
  const { tickets } = useTickets()
  
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit')
  const [isViewing, setIsViewing] = useState<boolean>(mode === 'view')
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(ticketId)
  const [loadedTicket, setLoadedTicket] = useState<ApiTicket | null>(null)

  // Update state when props change
  useEffect(() => {
    setIsEditing(mode === 'edit')
    setIsViewing(mode === 'view')
    setCurrentTicketId(ticketId)
  }, [mode, ticketId])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    complexity: 'medium',
    persona: '',
    contributor: '',
    model: '',
    effort_days: '',
    blocks: [],
    blocked_by: [],
    acceptance_criteria: '',
    tags: '',
    notes: '',
    risks: '',
    resources: ''
  })
  
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Use relative URL in production, absolute URL in development
  const API_BASE_URL = import.meta.env?.DEV ? 'http://localhost:8080/api/ticket' : '/api/ticket'

  /**
   * Load ticket data for editing when component mounts
   */
  useEffect(() => {
    if ((isEditing || isViewing) && currentTicketId) {
      loadTicketData(currentTicketId)
    }
  }, [currentTicketId, isEditing, isViewing])

  /**
   * Load ticket data from API for editing
   * @param {string} id - The ticket ID to load
   */
  const loadTicketData = async (id: string): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to load ticket: ${response.statusText}`)
      }
      
      const data = await response.json()
      const ticket: ApiTicket = data.ticket
      
      // Store the loaded ticket for markdown view
      setLoadedTicket(ticket)
      
      // Map API ticket data to form data
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        complexity: ticket.complexity || 'medium',
        persona: ticket.persona || '',
        contributor: ticket.contributor || '',
        model: ticket.model || '',
        effort_days: ticket.effort_days || '',
        blocks: ticket.blocks || [],
        blocked_by: ticket.blocked_by || [],
        acceptance_criteria: ticket.acceptance_criteria?.map(ac => ac.criteria).join('\n') || '',
        tags: ticket.tags?.join(', ') || '',
        notes: ticket.notes || '',
        risks: ticket.risks?.join('\n') || '',
        resources: ticket.resources?.join('\n') || ''
      })
    } catch (error) {
      console.error('Error loading ticket:', error)
      setErrorMessage(`Failed to load ticket: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles form submission for creating or updating a ticket
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      // Prepare the API ticket data from form data
      const ticketData: Partial<ApiTicket> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        complexity: formData.complexity,
        persona: formData.persona,
        contributor: formData.contributor,
        model: formData.model,
        effort_days: formData.effort_days === '' ? undefined : Number(formData.effort_days),
        blocks: formData.blocks,
        blocked_by: formData.blocked_by,
        acceptance_criteria: formData.acceptance_criteria 
          ? formData.acceptance_criteria.split('\n').filter(s => s.trim()).map(criteria => ({ criteria: criteria.trim(), complete: false }))
          : [],
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(s => s) : [],
        notes: formData.notes,
        risks: formData.risks ? formData.risks.split('\n').filter(s => s.trim()) : [],
        resources: formData.resources ? formData.resources.split('\n').filter(s => s.trim()) : []
      }

      let response: Response
      if (isEditing && currentTicketId) {
        // Update existing ticket
        response = await fetch(`${API_BASE_URL}/${currentTicketId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData),
        })
      } else {
        // Create new ticket
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      setShowSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)

      // For new tickets, update the current ticket ID and switch to edit mode
      if (!isEditing && result.ticket?.id) {
        setCurrentTicketId(result.ticket.id)
        setIsEditing(true)
        setLoadedTicket(result.ticket)
        
        // Update URL if possible
        if (onNavigate) {
          onNavigate('edit', result.ticket.id)
        }
      }

    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles changes to form inputs
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'effort_days' ? (value === '' ? '' : value) : value
    }))
  }

  /**
   * Handles changes to multi-select dropdowns for blocks and blocked_by
   */
  const handleMultiSelectChange = (fieldName: 'blocks' | 'blocked_by') => (e: ChangeEvent<HTMLSelectElement>): void => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedOptions
    }))
  }

  /**
   * Handles changes to Milkdown editor fields
   */
  const handleEditorChange = (fieldName: string) => (value: string): void => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  /**
   * Resets all form fields to their initial values
   * Called when the reset button is clicked
   */
  const resetForm = (): void => {
    setFormData({
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      complexity: 'medium',
      persona: '',
      contributor: '',
      model: '',
      effort_days: '',
      blocks: [],
      blocked_by: [],
      acceptance_criteria: '',
      tags: '',
      notes: '',
      risks: '',
      resources: ''
    })
  }

  /**
   * Navigate back to create mode
   */
  const goToCreateMode = (): void => {
    if (onNavigate) {
      onNavigate('create')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto">
          <div className="content-wrapper">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-green-600">Loading ticket data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Navigate back to the previous page
   */
  const goBack = (): void => {
    window.history.back()
  }

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto">
        <div className="content-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', minHeight: '48px' }}>
            {currentTicketId ? (
              <button
                onClick={goBack}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#7b9a3f',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6a8533';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7b9a3f';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Go back to previous page"
              >
                ←
              </button>
            ) : (
              <div></div>
            )}
            {currentTicketId && (
              <h2 style={{ color: '#111827', margin: 0, lineHeight: '1.75rem' }}>
                {currentTicketId}
              </h2>
            )}
          </div>

          {showSuccess && (
            <div className="success-message">
              <span className="success-text">
                Ticket {isEditing ? 'updated' : 'created'} successfully!
              </span>
            </div>
          )}

          {showError && (
            <div className="error-message">
              <span className="error-text">{errorMessage}</span>
            </div>
          )}

          {isViewing && loadedTicket && loadedTicket.id ? (
            <>
              <TicketMarkdownView 
                ticket={{
                  ...loadedTicket,
                  id: loadedTicket.id,
                  status: loadedTicket.status || 'open',
                  priority: loadedTicket.priority || 'medium',
                  complexity: loadedTicket.complexity || 'medium'
                }}
                isEditable={true}
                onTicketUpdate={(updatedFields) => {
                  if (loadedTicket) {
                    const updatedTicket: ApiTicket = { 
                      ...loadedTicket, 
                      ...updatedFields,
                      id: loadedTicket.id,
                      title: loadedTicket.title,
                      description: updatedFields.description || loadedTicket.description,
                      status: (updatedFields.status as any) || loadedTicket.status || 'open',
                      priority: (updatedFields.priority as any) || loadedTicket.priority || 'medium',
                      complexity: (updatedFields.complexity as any) || loadedTicket.complexity || 'medium'
                    }
                    setLoadedTicket(updatedTicket)
                    // Optionally save changes immediately or on a timer
                    // You could add debounced auto-save here
                  }
                }}
              />
              
              {/* Buttons for view mode */}
              <div 
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  zIndex: 1000,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '10px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <button 
                  type="button"
                  onClick={() => currentTicketId && onNavigate?.('edit', currentTicketId)}
                  className="btn-primary-green"
                >
                  Edit Ticket
                </button>
                
                <button 
                  type="button"
                  onClick={goToCreateMode}
                  className="btn-secondary-green"
                >
                  Create New
                </button>
              </div>
            </>
          ) : (            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Main form content */}
              <div style={{ flex: '1' }}>
                <form onSubmit={handleSubmit} className={`space-y-6 ${isViewing ? 'view-mode' : ''}`}>
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="title" className="form-label">
                          Title *
                        </label>
                        <input
                          id="title"
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="Enter ticket title"
                        />
                      </div>

                      <div>
                        <label id="description-label" className="form-label">
                          Description
                        </label>
                        <MilkdownEditor
                          id="description"
                          value={formData.description}
                          onChange={handleEditorChange('description')}
                          placeholder="Describe the ticket requirements..."
                          readOnly={isViewing}
                          minHeight="120px"
                          className={isViewing ? 'opacity-75' : ''}
                          aria-labelledby="description-label"
                        />
                      </div>
                    </div>
                  </div>



                  {/* Assignment & Collaboration */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment & Collaboration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="persona" className="form-label">
                          Persona
                        </label>
                        <input
                          id="persona"
                          type="text"
                          name="persona"
                          value={formData.persona}
                          onChange={handleChange}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="Target persona"
                        />
                      </div>

                      <div>
                        <label htmlFor="contributor" className="form-label">
                          Contributor
                        </label>
                        <input
                          id="contributor"
                          type="text"
                          name="contributor"
                          value={formData.contributor}
                          onChange={handleChange}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="Assigned contributor"
                        />
                      </div>

                      <div>
                        <label htmlFor="model" className="form-label">
                          AI Model
                        </label>
                        <input
                          id="model"
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="Associated AI model"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content & Metadata */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Content & Metadata</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="acceptance_criteria" className="form-label">
                          Acceptance Criteria
                        </label>
                        <textarea
                          id="acceptance_criteria"
                          name="acceptance_criteria"
                          value={formData.acceptance_criteria}
                          onChange={handleChange}
                          rows={4}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="One criteria per line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each acceptance criterion on a new line</p>
                      </div>

                      <div>
                        <label htmlFor="tags" className="form-label">
                          Tags
                        </label>
                        <input
                          id="tags"
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="authentication, security, backend"
                        />
                        <p className="text-sm text-gray-500 mt-1">Comma-separated list of tags</p>
                      </div>

                      <div>
                        <label id="notes-label" className="form-label">
                          Notes
                        </label>
                        <MilkdownEditor
                          id="notes"
                          value={formData.notes}
                          onChange={handleEditorChange('notes')}
                          placeholder="Additional notes..."
                          readOnly={isViewing}
                          minHeight="100px"
                          className={isViewing ? 'opacity-75' : ''}
                          aria-labelledby="notes-label"
                        />
                      </div>

                      <div>
                        <label htmlFor="risks" className="form-label">
                          Risks
                        </label>
                        <textarea
                          id="risks"
                          name="risks"
                          value={formData.risks}
                          onChange={handleChange}
                          rows={3}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="One risk per line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each risk on a new line</p>
                      </div>

                      <div>
                        <label htmlFor="resources" className="form-label">
                          Resources
                        </label>
                        <textarea
                          id="resources"
                          name="resources"
                          value={formData.resources}
                          onChange={handleChange}
                          rows={3}
                          readOnly={isViewing}
                          className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                          placeholder="One resource/link per line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each resource URL or description on a new line</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Sidebar with Status & Priority and Dependencies */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Floating status form on the right */}
                <div 
                  style={{
                    width: '320px',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                    position: 'sticky',
                    top: '20px',
                    height: 'fit-content',
                    zIndex: 20
                  }}
                >
                  <h3 className="text-lg font-semibold text-white" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Status & Priority</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isViewing}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        disabled={isViewing}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="complexity" className="block text-sm font-medium text-gray-300 mb-2">
                        Complexity
                      </label>
                      <select
                        id="complexity"
                        name="complexity"
                        value={formData.complexity}
                        onChange={handleChange}
                        disabled={isViewing}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="effort_days" className="block text-sm font-medium text-gray-300 mb-2">
                        Effort (Days)
                      </label>
                      <input
                        id="effort_days"
                        type="number"
                        name="effort_days"
                        value={formData.effort_days}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        readOnly={isViewing}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 2.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Dependencies Block - Separate floating block */}
                <div 
                  style={{
                    width: '320px',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(139, 69, 19, 0.25)',
                    position: 'sticky',
                    top: '380px',
                    height: 'fit-content',
                    zIndex: 10
                  }}
                >
                  <h3 className="text-lg font-semibold text-white" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Dependencies</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="blocks" className="block text-sm font-medium text-orange-100">
                          Blocks (Tickets)
                        </label>
                        {formData.blocks.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, blocks: [] }))}
                            className="text-xs text-red-300 hover:text-red-200 underline"
                            disabled={isViewing}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <select
                        id="blocks"
                        name="blocks"
                        multiple
                        value={formData.blocks}
                        onChange={handleMultiSelectChange('blocks')}
                        disabled={isViewing}
                        className="dependencies-dropdown"
                        style={{ 
                          minHeight: formData.blocks.length > 0 ? '80px' : '40px',
                          maxHeight: '120px',
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#A0522D',
                          border: '1px solid #CD853F',
                          borderRadius: '6px',
                          color: 'white'
                        }}
                      >
                        {tickets
                          .filter(ticket => ticket.id !== currentTicketId)
                          .map(ticket => (
                            <option key={ticket.id} value={ticket.id}>
                              {ticket.id}
                            </option>
                          ))
                        }
                      </select>
                      <p className="text-xs text-orange-200 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="blocked_by" className="block text-sm font-medium text-orange-100">
                          Blocked By (Tickets)
                        </label>
                        {formData.blocked_by.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, blocked_by: [] }))}
                            className="text-xs text-red-300 hover:text-red-200 underline"
                            disabled={isViewing}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <select
                        id="blocked_by"
                        name="blocked_by"
                        multiple
                        value={formData.blocked_by}
                        onChange={handleMultiSelectChange('blocked_by')}
                        disabled={isViewing}
                        className="dependencies-dropdown"
                        style={{ 
                          minHeight: formData.blocked_by.length > 0 ? '80px' : '40px',
                          maxHeight: '120px',
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#A0522D',
                          border: '1px solid #CD853F',
                          borderRadius: '6px',
                          color: 'white'
                        }}
                      >
                        {tickets
                          .filter(ticket => ticket.id !== currentTicketId)
                          .map(ticket => (
                            <option key={ticket.id} value={ticket.id}>
                              {ticket.id}
                            </option>
                          ))
                        }
                      </select>
                      <p className="text-xs text-orange-200 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons - only show in form mode */}
          {!isViewing && (
            <div 
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <button 
                type="button" 
                className="btn-primary-green"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault()
                  // Get the form element and manually call submit
                  const form = document.querySelector('form')
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                    form.dispatchEvent(submitEvent)
                  }
                }}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Ticket' : 'Create Ticket')}
              </button>
              
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-secondary-green"
                disabled={loading}
              >
                Reset Form
              </button>
              
              {isEditing && (
                <button 
                  type="button"
                  onClick={goToCreateMode}
                  className="btn-secondary-green"
                >
                  Create New
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTicket
