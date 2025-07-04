import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

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
  collabotator?: string
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
  /** Collaborator assigned to this ticket */
  collabotator: string
  /** AI model associated with this ticket */
  model: string
  /** Estimated effort in days */
  effort_days: number | ''
  /** List of ticket IDs that this ticket blocks */
  blocks: string
  /** List of ticket IDs that block this ticket */
  blocked_by: string
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
 * complexity, persona, collaborator, acceptance criteria, and more.
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
  useTickets()
  
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit')
  const [isViewing, setIsViewing] = useState<boolean>(mode === 'view')
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(ticketId)

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
    collabotator: '',
    model: '',
    effort_days: '',
    blocks: '',
    blocked_by: '',
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

  const API_BASE_URL = 'http://localhost:7073/api/ticket'

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
      
      // Map API ticket data to form data
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        complexity: ticket.complexity || 'medium',
        persona: ticket.persona || '',
        collabotator: ticket.collabotator || '',
        model: ticket.model || '',
        effort_days: ticket.effort_days || '',
        blocks: ticket.blocks?.join(', ') || '',
        blocked_by: ticket.blocked_by?.join(', ') || '',
        acceptance_criteria: ticket.acceptance_criteria?.map(ac => ac.criteria).join('\n') || '',
        tags: ticket.tags?.join(', ') || '',
        notes: ticket.notes || '',
        risks: ticket.risks?.join('\n') || '',
        resources: ticket.resources?.join('\n') || ''
      })
    } catch (error) {
      console.error('Error loading ticket:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load ticket')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Convert form data to API format
   * @param {FormData} data - The form data to convert
   * @returns {ApiTicket} The API-formatted ticket data
   */
  const convertFormDataToApiFormat = (data: FormData): ApiTicket => {
    return {
      ...(isEditing && currentTicketId ? { id: currentTicketId } : {}),
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      complexity: data.complexity,
      persona: data.persona || undefined,
      collabotator: data.collabotator || undefined,
      model: data.model || undefined,
      effort_days: data.effort_days ? Number(data.effort_days) : undefined,
      blocks: data.blocks ? data.blocks.split(',').map(s => s.trim()).filter(Boolean) : [],
      blocked_by: data.blocked_by ? data.blocked_by.split(',').map(s => s.trim()).filter(Boolean) : [],
      acceptance_criteria: data.acceptance_criteria ? 
        data.acceptance_criteria.split('\n').map(criteria => ({ criteria: criteria.trim(), complete: false })).filter(ac => ac.criteria) : [],
      tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: data.notes || undefined,
      risks: data.risks ? data.risks.split('\n').map(s => s.trim()).filter(Boolean) : [],
      resources: data.resources ? data.resources.split('\n').map(s => s.trim()).filter(Boolean) : []
    }
  }

  /**
   * Handles form submission for creating or updating a ticket
   * @param {FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const apiData = convertFormDataToApiFormat(formData)
      
      const url = isEditing ? `${API_BASE_URL}/${currentTicketId}` : API_BASE_URL
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} ticket: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // If creating a new ticket, reset form and optionally navigate to view mode
      if (!isEditing) {
        resetForm()
        if (result.ticket?.id && onNavigate) {
          setTimeout(() => {
            onNavigate('view', result.ticket.id)
          }, 1000)
        }
      }
      
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit ticket')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles changes to form input fields
   * Updates the corresponding field in the form data state
   * 
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'effort_days' ? (value === '' ? '' : value) : value
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
      collabotator: '',
      model: '',
      effort_days: '',
      blocks: '',
      blocked_by: '',
      acceptance_criteria: '',
      tags: '',
      notes: '',
      risks: '',
      resources: ''
    })
  }

  /**
   * Navigate to edit a specific ticket
   * @param {string} id - The ticket ID to edit
   */
  const editTicket = (id: string): void => {
    if (onNavigate) {
      onNavigate('edit', id)
    }
  }

  /**
   * Navigate to view a specific ticket
   * @param {string} id - The ticket ID to view
   */
  const viewTicket = (id: string): void => {
    if (onNavigate) {
      onNavigate('view', id)
    }
  }

  /**
   * Navigate back to create mode
   */
  const goToCreateMode = (): void => {
    if (onNavigate) {
      onNavigate('create')
    }
  }

  /**
   * Get the current mode display name
   */
  const getModeDisplayName = (): string => {
    if (isViewing) return 'View'
    if (isEditing) return 'Edit'
    return 'Create'
  }

  /**
   * Get the current mode icon
   */
  const getModeIcon = (): string => {
    if (isViewing) return '👁️'
    if (isEditing) return '✏️'
    return '➕'
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

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="content-wrapper">
          <h2 className="section-title">
            <span className="icon-spacing">{getModeIcon()}</span>
            {getModeDisplayName()} Ticket
            {currentTicketId && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                {currentTicketId}
              </span>
            )}
          </h2>

          {/* Mode switcher for existing tickets */}
          {currentTicketId && (
            <div className="mode-switcher">
              <button
                onClick={() => onNavigate?.('view', currentTicketId)}
                className={isViewing ? 'active' : ''}
              >
                👁️ View
              </button>
              <button
                onClick={() => onNavigate?.('edit', currentTicketId)}
                className={isEditing ? 'active' : ''}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onNavigate?.('create')}
                className={!isEditing && !isViewing ? 'active' : ''}
              >
                ➕ Create New
              </button>
            </div>
          )}

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-700">Debug Info:</h4>
              <p className="text-sm text-gray-600">Mode: {getModeDisplayName()}</p>
              <p className="text-sm text-gray-600">Ticket ID: {currentTicketId || 'None'}</p>
              <p className="text-sm text-gray-600">API URL: {API_BASE_URL}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Test modes:</p>
                <button 
                  onClick={() => editTicket('healthcare.analytics.reporting-engine-015')}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit Sample Ticket
                </button>
                <button 
                  onClick={() => viewTicket('healthcare.analytics.reporting-engine-015')}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  View Sample Ticket
                </button>
                <button 
                  onClick={goToCreateMode}
                  className="text-xs bg-purple-500 text-white px-2 py-1 rounded"
                >
                  Create Mode
                </button>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span className="success-text">
                Ticket {isEditing ? 'updated' : 'created'} successfully!
              </span>
            </div>
          )}

          {showError && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              <span className="error-text">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${isViewing ? 'view-mode' : ''}`}>
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="form-label">
                    <span className="icon-spacing">📝</span>
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

                <div className="md:col-span-2">
                  <label htmlFor="description" className="form-label">
                    <span className="icon-spacing">📄</span>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    readOnly={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="Describe the ticket requirements..."
                  />
                </div>

                <div>
                  <label htmlFor="status" className="form-label">
                    <span className="icon-spacing">📊</span>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                  >
                    <option value="open">🟢 Open</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="closed">🔴 Closed</option>
                    <option value="blocked">🚫 Blocked</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="form-label">
                    <span className="icon-spacing">⚡</span>
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="high">🔥 High</option>
                    <option value="critical">🚨 Critical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="complexity" className="form-label">
                    <span className="icon-spacing">🎯</span>
                    Complexity
                  </label>
                  <select
                    id="complexity"
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleChange}
                    disabled={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="high">🔥 High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="effort_days" className="form-label">
                    <span className="icon-spacing">⏱️</span>
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
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="e.g., 2.5"
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
                    <span className="icon-spacing">👤</span>
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
                  <label htmlFor="collabotator" className="form-label">
                    <span className="icon-spacing">🤝</span>
                    Collaborator
                  </label>
                  <input
                    id="collabotator"
                    type="text"
                    name="collabotator"
                    value={formData.collabotator}
                    onChange={handleChange}
                    readOnly={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="Assigned collaborator"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="form-label">
                    <span className="icon-spacing">🤖</span>
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

            {/* Dependencies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="blocks" className="form-label">
                    <span className="icon-spacing">🚫</span>
                    Blocks (Ticket IDs)
                  </label>
                  <input
                    id="blocks"
                    type="text"
                    name="blocks"
                    value={formData.blocks}
                    onChange={handleChange}
                    readOnly={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="ticket-id-1, ticket-id-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Comma-separated list of ticket IDs that this ticket blocks</p>
                </div>

                <div>
                  <label htmlFor="blocked_by" className="form-label">
                    <span className="icon-spacing">⛔</span>
                    Blocked By (Ticket IDs)
                  </label>
                  <input
                    id="blocked_by"
                    type="text"
                    name="blocked_by"
                    value={formData.blocked_by}
                    onChange={handleChange}
                    readOnly={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="ticket-id-1, ticket-id-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Comma-separated list of ticket IDs that block this ticket</p>
                </div>
              </div>
            </div>

            {/* Content & Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content & Metadata</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="acceptance_criteria" className="form-label">
                    <span className="icon-spacing">✅</span>
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
                    <span className="icon-spacing">🏷️</span>
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
                  <label htmlFor="notes" className="form-label">
                    <span className="icon-spacing">📝</span>
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    readOnly={isViewing}
                    className={`input-green ${isViewing ? 'bg-gray-50' : ''}`}
                    placeholder="Additional notes..."
                  />
                </div>

                <div>
                  <label htmlFor="risks" className="form-label">
                    <span className="icon-spacing">⚠️</span>
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
                    <span className="icon-spacing">🔗</span>
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

            <div className="button-group">
              {!isViewing && (
                <button 
                  type="submit" 
                  className="btn-primary-green"
                  disabled={loading}
                >
                  <span className="icon-spacing">💾</span>
                  {loading ? 'Saving...' : (isEditing ? 'Update Ticket' : 'Create Ticket')}
                </button>
              )}
              
              {!isViewing && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn-secondary-green"
                  disabled={loading}
                >
                  <span className="icon-spacing">🔄</span>
                  Reset Form
                </button>
              )}
              
              {(isEditing || isViewing) && (
                <button 
                  type="button"
                  onClick={goToCreateMode}
                  className="btn-secondary-green"
                >
                  <span className="icon-spacing">➕</span>
                  Create New
                </button>
              )}

              {isViewing && currentTicketId && (
                <button 
                  type="button"
                  onClick={() => onNavigate?.('edit', currentTicketId)}
                  className="btn-primary-green"
                >
                  <span className="icon-spacing">✏️</span>
                  Edit Ticket
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/**
 * Default export of the CreateTicket component
 * @default CreateTicket
 */
export default CreateTicket
