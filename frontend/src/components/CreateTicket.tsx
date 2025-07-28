import React, { useState, FormEvent, ChangeEvent, useEffect, useContext } from 'react'
import usePrefix from '../context/usePrefix'
import { LayerContext } from '../context/LayerContext'
import { ComponentContext } from '../context/ComponentContext'
import { FeatureContext } from '../context/FeatureContext'
import { useTickets } from '../context/TicketContext'
import TicketMarkdownView from './TicketMarkdownView'
import { MilkdownEditor } from './MilkdownEditor'
import { StatusContext } from '../context/StatusContext'
import { PriorityContext } from '../context/PriorityContext'
import { ComplexityContext } from '../context/ComplexityContext'
import { usePersonas } from '../context/PersonaContext'
import { useContributors } from '../context/ContributorContext'
import Avatar from 'boring-avatars'
import { TotemIcon } from './TotemIcon'

/**
 * API Ticket interface matching the backend DTO structure
 * @interface ApiTicket
 */
interface ApiTicket {
  id?: string
  title: string
  description: string
  status?: string
  priority?: string
  complexity?: string
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
  start_time?: number;
  end_time?: number;
  layer?: string;
  component?: string;
  feature?: string;
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
  status: string
  /** Priority level of the ticket */
  priority: string
  /** Complexity level of the ticket */
  complexity: string
  /** Target persona for this ticket */
  persona: string
  /** Contributor assigned to this ticket */
  contributor: string
  /** Assignee of the ticket */
  assignee?: string
  /** Collaborators (comma separated string) */
  collaborators?: string
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
  /** Scheduling: start time as timestamp (ms since epoch, or -1 for unset) */
  start_time?: number;
  /** Scheduling: end time as timestamp (ms since epoch, or -1 for unset) */
  end_time?: number;
  /** Layer for ticket ID context */
  layer?: string;
  /** Component for ticket ID context */
  component?: string;
  /** Feature for ticket ID context */
  feature?: string;
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
  // Context hooks for prefix, layer, component, feature
  const { prefix } = usePrefix();
  const layerCtx = useContext(LayerContext);
  const componentCtx = useContext(ComponentContext);
  const featureCtx = useContext(FeatureContext);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  // Keep formData in sync with dropdowns for context-driven fields
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      layer: selectedLayer,
      component: selectedComponent,
      feature: selectedFeature
    }));
  }, [selectedLayer, selectedComponent, selectedFeature]);
  // For global ticket number
  const { tickets } = useTickets();
  // Compute the next global ticket number (2-digit, not context-dependent)
  const getNextTicketNumber = () => {
    console.log('[DEBUG] getNextTicketNumber called with tickets:', tickets);
    if (!tickets || tickets.length === 0) return '01';
    const numbers = tickets
      .map(t => {
        const match = t.id && t.id.match(/-(\d{2,})$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null) as number[];
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    console.log(String(max + 1).padStart(3, '0'))
    return String(max + 1).padStart(3, '0');
  };
  const nextNumber = getNextTicketNumber();
  // Build the ticket ID preview
  const ticketIdPreview =
    prefix && selectedLayer && selectedComponent && selectedFeature
      ? `${prefix}.${selectedLayer}.${selectedComponent}-${selectedFeature}-${nextNumber}`
      : '...';
  // Form data state
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
    resources: '',
    layer: '',
    component: '',
    feature: ''
  });

  // Get actions from context for blocks/blocked_by dropdowns and CRUD
  const { updateTicket, addTicket } = useTickets()
  const statusContext = useContext(StatusContext);
  const statuses = statusContext?.statuses || [];
  const statusLoading = statusContext?.loading || false;

  const priorityContext = useContext(PriorityContext);
  const priorities = priorityContext?.priorities || [];
  const priorityLoading = priorityContext?.loading || false;

  const complexityContext = useContext(ComplexityContext);
  const complexities = complexityContext?.complexities || [];
  const complexityLoading = complexityContext?.loading || false;

  // Persona context
  const { personas, loading: personaLoading } = usePersonas();
  // Contributor context
  const { contributors, loading: contributorLoading } = useContributors();
  
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
  
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const { name, value } = e.target;
    setFormData(prev => {
      let updated = {
        ...prev,
        [name]: name === 'effort_days' ? (value === '' ? '' : value) : value
      };
      if (
        name === 'status' &&
        value === 'in-progress' &&
        (prev.start_time === undefined || prev.start_time === null || prev.start_time < 0)
      ) {
        updated.start_time = Date.now();
      }
      if (
        name === 'status' &&
        value === 'done' &&
        (prev.end_time === undefined || prev.end_time === null || prev.end_time < 0)
      ) {
        updated.end_time = Date.now();
      }
      return updated;
    });
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
    if (fieldName === 'description') {
      // Debug: log description changes
      console.log('[DEBUG] handleEditorChange(description):', value)
    }
    if (fieldName === 'notes') {
      // Debug: log notes changes
      console.log('[DEBUG] handleEditorChange(notes):', value)
    }
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
      complexity: 'l',
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
          {/* Ticket ID Preview and Dropdowns (editable only in create mode) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket ID</h3>
            {mode === 'create' ? (
              <>
                <div
                  className="flex flex-row gap-2 items-center"
                  style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', width: '100%', overflowX: 'auto' }}
                >
                    <label className="form-label">Prefix</label>
                    <input type="text" value={prefix} disabled className="input-green" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#166534' }} />
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#166534', flex: '0 0 16px' }}>.</span>
                    <label className="form-label">Layer</label>
                    <select
                      value={selectedLayer}
                      onChange={e => setSelectedLayer(e.target.value)}
                      className="input-green"
                      style={{  fontFamily: 'monospace', fontWeight: 600, color: '#166534' }}
                      disabled={layerCtx?.loading}
                    >
                      <option value="">Select layer</option>
                      {layerCtx?.layers?.map(l => (
                        <option key={l.key} value={l.key}>{l.key}</option>
                      ))}
                    </select>
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#166534', flex: '0 0 16px' }}>.</span>
                  <div style={{ flex: '0 0 180px' }}>
                    <label className="form-label">Component</label>
                    <select
                      value={selectedComponent}
                      onChange={e => setSelectedComponent(e.target.value)}
                      className="input-green"
                      style={{ fontFamily: 'monospace', fontWeight: 600, color: '#166534' }}
                      disabled={componentCtx?.loading}
                    >
                      <option value="">Select component</option>
                      {componentCtx?.components?.map(c => (
                        <option key={c.key} value={c.key}>{c.key}</option>
                      ))}
                    </select>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#166534', flex: '0 0 16px' }}>-</span>
                  <div style={{ flex: '0 0 180px' }}>
                    <label className="form-label">Feature</label>
                    <select
                      value={selectedFeature}
                      onChange={e => setSelectedFeature(e.target.value)}
                      className="input-green"
                      style={{ width: '100%', fontFamily: 'monospace', fontWeight: 600, color: '#166534' }}
                      disabled={featureCtx?.loading}
                    >
                      <option value="">Select feature</option>
                      {featureCtx?.features?.map(f => (
                        <option key={f.key} value={f.key}>{f.key}</option>
                      ))}
                    </select>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#166534', flex: '0 0 16px' }}>-</span>
                  <div style={{ flex: '0 0 90px' }}>
                    <label className="form-label">Number</label>
                    <input type="text" value={nextNumber} disabled className="input-green" style={{ width: '100%', fontFamily: 'monospace', fontWeight: 600, color: '#166534' }} />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="font-mono text-green-700 text-lg">{ticketIdPreview}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <input
                    type="text"
                    value={loadedTicket?.id || currentTicketId || ''}
                    disabled
                    className="input-green"
                    style={{ minWidth: 320, fontFamily: 'monospace', fontWeight: 600, color: '#166534' }}
                  />
                </div>
              </div>
            )}
          </div>
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
                &#8592;
              </button>
            ) : null}
          </div>
          {/* Success/Failure message at the top of the screen */}
          {(showSuccess || showError) && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              zIndex: 2000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                marginTop: 24,
                background: showSuccess ? '#22c55e' : '#ef4444',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                fontWeight: 600,
                fontSize: 18,
                pointerEvents: 'auto',
                minWidth: 320,
                textAlign: 'center',
              }}>
                {showSuccess ? successMessage : errorMessage}
              </div>
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
                isEditable={false}
              />
              {/* Buttons for view mode */}
              <div 
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '260px',
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
          ) : (
            !isViewing ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Main form content */}
                <div style={{ flex: '1' }} >
                  <form onSubmit={handleSubmit} className={`space-y-6`}>
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 gap-6" >
                        <div >
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
                            className={`input-green`}
                            placeholder="Enter ticket title"
                            style={{
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              margin: 0,
                              fontSize: '1rem',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>
                        <div>
                          <label id="description-label" className="form-label">
                            Description
                          </label>
                            <MilkdownEditor
                              id="description"
                              key={currentTicketId || 'new'}
                              value={formData.description}
                              onChange={value => {
                                console.log('[DEBUG] MilkdownEditor onChange (description):', value)
                                handleEditorChange('description')(value)
                              }}
                              placeholder="a description..."
                              minHeight="100px" 
                              className={'milk-desc'}
                              aria-labelledby="description-label"
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
                            className={`input-green`}
                            placeholder="One criteria per line..."
                            style={{
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              margin: 0,
                              fontSize: '1rem',
                              fontFamily: 'inherit'
                            }}
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
                            className={`input-green`}
                            placeholder="authentication, security, backend"
                            style={{
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              margin: 0,
                              fontSize: '1rem',
                              fontFamily: 'inherit'
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-1">Comma-separated list of tags</p>
                        </div>
                        <div>
                          <label id="notes-label" className="form-label">
                            Notes
                          </label>
                          <MilkdownEditor
                            id="notes"
                            key={currentTicketId || 'new'}
                            value={formData.notes ?? ''}
                            onChange={value => {
                              console.log('[DEBUG] MilkdownEditor onChange (notes):', value)
                              handleEditorChange('notes')(value)
                            }}
                            placeholder="Additional notes..."
                            minHeight="100px"
                            className={''}
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
                            className={`input-green`}
                            placeholder="One risk per line..."
                            style={{
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              margin: 0,
                              fontSize: '1rem',
                              fontFamily: 'inherit'
                            }}
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
                            className={`input-green`}
                            placeholder="One resource/link per line..."
                            style={{
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              margin: 0,
                              fontSize: '1rem',
                              fontFamily: 'inherit'
                            }}
                          />
                          <p className="text-sm text-gray-500 mt-1">Enter each resource URL or description on a new line</p>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                {/* Sidebar with Status & Priority and Dependencies */}
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px',
                    position: 'sticky',
                    top: '20px',
                    height: 'fit-content',
                    zIndex: 20
                  }}
                >
                  {/* Status & Priority Block */}
                  <div 
                    style={{
                      width: '320px',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                      height: 'fit-content'
                    }}
                  >
                    <h3 className="text-lg font-semibold text-white" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Status & Priority</h3>
                    <div className="space-y-6">
                      <TotemIcon seed={ticketId} size={4} showControls={false} highRes/>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {statusLoading ? (
                            <option>Loading…</option>
                          ) : (
                            statuses.map((s: { key: string; description: string }) => (
                              <option key={s.key} value={s.key}>{s.key}</option>
                            ))
                          )}
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
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {priorityLoading ? (
                            <option>Loading…</option>
                          ) : (
                            priorities.map((p: { key: string; description: string }) => (
                              <option key={p.key} value={p.key}>{p.key}</option>
                            ))
                          )}
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
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {complexityLoading ? (
                            <option>Loading…</option>
                          ) : (
                            complexities.map((c: { key: string; description: string }) => (
                              <option key={c.key} value={c.key}>{c.key}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Assignment & Collaboration Block */}
                  <div
                    style={{
                      width: '320px',
                      backgroundColor: '#223344',
                      color: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(34, 51, 68, 0.18)',
                      height: 'fit-content',
                      marginTop: '20px'
                    }}
                  >
                    <h3 className="text-lg font-semibold text-white" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Assignment & Collaboration</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="persona" className="block text-sm font-medium text-gray-300 mb-2">
                        </label>
                                    <Avatar
                                      size={20}
                                      name={formData.persona}
                                      variant="pixel"
                                      colors={["#A5B4FC", "#6366F1", "#818CF8", "#3730A3", "#C7D2FE"]}
                                      square
                                    />
                        <select
                          id="persona"
                          name="persona"
                          value={formData.persona}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {personaLoading ? (
                            <option>Loading…</option>
                          ) : (
                            <>
                              <option value="">Select persona</option>
                              {personas.map((p) => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="contributor" className="block text-sm font-medium text-gray-300 mb-2">
                        </label>
                        <Avatar
                          size={20}
                          name={formData.contributor}
                          variant="pixel"
                          colors={["#FFDD00", "#FFAB00", "#FF6F00", "#D50000", "#6200EA"]}
                          square
                        />
                        <select
                          id="contributor"
                          name="contributor"
                          value={formData.contributor}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {contributorLoading ? (
                            <option>Loading…</option>
                          ) : (
                            <>
                              <option value="">Select contributor</option>
                              {contributors.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Dependencies Block */}
                  <div 
                    style={{
                      width: '320px',
                      backgroundColor: '#8B4513',
                      color: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(139, 69, 19, 0.25)',
                      height: 'fit-content'
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
                          {(tickets && tickets.length > 0
                            ? tickets.filter(ticket => !currentTicketId || ticket.id !== currentTicketId)
                            : [])
                            .map(ticket => (
                              <option key={ticket.id} value={ticket.id}>
                                {ticket.id} - {ticket.title}
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
                          {(tickets && tickets.length > 0
                            ? tickets.filter(ticket => !currentTicketId || ticket.id !== currentTicketId)
                            : [])
                            .map(ticket => (
                              <option key={ticket.id} value={ticket.id}>
                                {ticket.id} - {ticket.title}
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
          ) : null
          )}

          {/* Action buttons - only show in form mode */}
          {!isViewing && (
            <div 
              style={{
                position: 'fixed',
                bottom: '20px',
                left: '260px',
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
                onClick={async (e) => {
                  e.preventDefault();
                  // Convert acceptance_criteria string to array of objects
                  const acceptanceCriteriaArr = formData.acceptance_criteria
                    ? formData.acceptance_criteria.split('\n').filter(s => s.trim()).map(criteria => ({ criteria: criteria.trim(), complete: false }))
                    : [];
                  // Convert tags string to array
                  const tagsArr = formData.tags
                    ? formData.tags.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
                  // Convert risks and resources string to array
                  const risksArr = formData.risks
                    ? formData.risks.split('\n').map(s => s.trim()).filter(Boolean)
                    : [];
                  const resourcesArr = formData.resources
                    ? formData.resources.split('\n').map(s => s.trim()).filter(Boolean)
                    : [];
                  // Convert effort_days to number or undefined
                  const effortDaysVal = formData.effort_days === '' ? undefined : Number(formData.effort_days);
                  // Always use deterministic ticket ID for create and update
                  const deterministicId =
                    prefix && selectedLayer && selectedComponent && selectedFeature
                      ? `${prefix}.${selectedLayer}.${selectedComponent}-${selectedFeature}-${nextNumber}`
                      : undefined;
                  if (isEditing && currentTicketId) {
                    // Update existing ticket
                    try {
                      await updateTicket({
                        ...formData,
                        id: deterministicId || currentTicketId,
                        acceptance_criteria: acceptanceCriteriaArr,
                        tags: tagsArr,
                        risks: risksArr,
                        resources: resourcesArr,
                        effort_days: effortDaysVal
                      });
                      setSuccessMessage('Ticket updated successfully!');
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                    } catch (err: unknown) {
                      if (err instanceof Error) {
                        setErrorMessage(`Failed to create ticket. ${err.message}`);
                      } else {
                        setErrorMessage('Failed to create ticket. Unknown error');
                      }
                      setShowError(true);
                      setTimeout(() => setShowError(false), 4000);
                    }
                  } else {
                    // Create new ticket
                    try {
                      await addTicket({
                        ...formData,
                        id: deterministicId,
                        acceptance_criteria: acceptanceCriteriaArr,
                        tags: tagsArr,
                        risks: risksArr,
                        resources: resourcesArr,
                        effort_days: effortDaysVal
                      });
                      setSuccessMessage('Ticket created successfully!');
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                      // Reset the form after successful creation
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
                        resources: '',
                        layer: '',
                        component: '',
                        feature: ''
                      });
                    } catch (err: unknown) {
                      if (err instanceof Error) {
                        setErrorMessage(`Failed to create ticket. ${err.message}`);
                      } else {
                        setErrorMessage('Failed to create ticket. Unknown error');
                      }
                      setShowError(true);
                      setTimeout(() => setShowError(false), 4000);
                    }
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
