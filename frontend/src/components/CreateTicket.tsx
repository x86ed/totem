import React, { useState, FormEvent, ChangeEvent } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

interface FormData {
  title: string
  description: string
  priority: Ticket['priority']
  assignee: string
  milestone: string
}

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

  const generateTicketId = (): string => {
    const timestamp = Date.now().toString().slice(-4)
    return `TKT-${timestamp}`
  }

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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

export default CreateTicket
