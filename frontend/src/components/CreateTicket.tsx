import React, { useState, FormEvent, ChangeEvent } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

/**
 * Form data interface for creating a new ticket
 * @interface FormData
 */
interface FormData {
  /** The title of the ticket (required) */
  title: string
  /** Optional description providing details about the ticket */
  description: string
  /** Priority level of the ticket (low, medium, high) */
  priority: Ticket['priority']
  /** Name of the person assigned to work on the ticket */
  assignee: string
  /** ID of the milestone this ticket belongs to */
  milestone: string
}

/**
 * CreateTicket Component
 * 
 * A form component for creating new tickets in the project management system.
 * Provides fields for title, description, priority, assignee, and milestone selection.
 * 
 * Features:
 * - Form validation (title is required)
 * - Auto-generated unique ticket IDs
 * - Success message display after ticket creation
 * - Form reset functionality
 * - Accessible form labels and structure
 * 
 * @component
 * @returns {JSX.Element} The CreateTicket form component
 * 
 * @example
 * ```tsx
 * import CreateTicket from './components/CreateTicket'
 * 
 * function App() {
 *   return (
 *     <div>
 *       <CreateTicket />
 *     </div>
 *   )
 * }
 * ```
 */
const CreateTicket: React.FC = () => {
  const { addTicket, milestones } = useTickets()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    milestone: ''
  })
  const [showSuccess, setShowSuccess] = useState<boolean>(false)

  /**
   * Generates a unique ticket ID using timestamp
   * @returns {string} A unique ticket ID in format "TKT-XXXX"
   */
  const generateTicketId = (): string => {
    const timestamp = Date.now().toString().slice(-4)
    return `TKT-${timestamp}`
  }

  /**
   * Handles form submission for creating a new ticket
   * - Prevents default form submission
   * - Creates new ticket with generated ID and current date
   * - Resets form and shows success message
   * 
   * @param {FormEvent<HTMLFormElement>} e - The form submit event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    
    const newTicket: Ticket = {
      id: generateTicketId(),
      ...formData,
      status: 'todo',
      created: new Date().toISOString().split('T')[0]
    }

    addTicket(newTicket)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      milestone: ''
    })

    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
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
      [name]: value
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
      priority: 'medium',
      assignee: '',
      milestone: ''
    })
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="content-wrapper">
          <h2 className="section-title">
            <span className="icon-spacing">🎫</span>
            Create New Ticket
          </h2>

          {showSuccess && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span className="success-text">Ticket created successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-section">
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
                className="input-green"
                placeholder="Enter ticket title"
              />
            </div>

            <div className="form-section">
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
                className="input-green"
                placeholder="Describe the ticket requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-section">
                <label htmlFor="priority" className="form-label">
                  <span className="icon-spacing">⚡</span>
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-green"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="high">🔥 High</option>
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="assignee" className="form-label">
                  <span className="icon-spacing">👤</span>
                  Assignee
                </label>
                <input
                  id="assignee"
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="input-green"
                  placeholder="Enter assignee name"
                />
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="milestone" className="form-label">
                <span className="icon-spacing">🗺️</span>
                Milestone
              </label>
              <select
                id="milestone"
                name="milestone"
                value={formData.milestone}
                onChange={handleChange}
                className="input-green"
              >
                <option value="">Select milestone...</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title} ({milestone.dueDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary-green">
                <span className="icon-spacing">💾</span>
                Create Ticket
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="btn-secondary-green"
              >
                <span className="icon-spacing">🔄</span>
                Reset Form
              </button>
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
