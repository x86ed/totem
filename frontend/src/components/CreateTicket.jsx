import React, { useState } from 'react'
import { useTickets } from '../context/TicketContext'

const CreateTicket = () => {
  const { addTicket, milestones } = useTickets()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    milestone: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const generateTicketId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `TKT-${timestamp}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newTicket = {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
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
          <div className="flex items-center mb-6">
            <span className="icon-spacing text-2xl">➕</span>
            <h2 className="text-2xl font-semibold" style={{ color: '#2d3e2e' }}>
              Create New Ticket
            </h2>
          </div>

          {showSuccess && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span className="success-text">Ticket created successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-section">
              <label className="form-label">
                <span className="icon-spacing">📝</span>
                Title *
              </label>
              <input
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
              <label className="form-label">
                <span className="icon-spacing">📄</span>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-green resize-y"
                placeholder="Describe the ticket requirements or issue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-section">
                <label className="form-label">
                  <span className="icon-spacing">🔥</span>
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-green"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">
                  <span className="icon-spacing">👤</span>
                  Assignee
                </label>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="input-green"
                  placeholder="Optional"
                />
              </div>

              <div className="form-section">
                <label className="form-label">
                  <span className="icon-spacing">🏁</span>
                  Milestone
                </label>
                <select
                  name="milestone"
                  value={formData.milestone}
                  onChange={handleChange}
                  className="input-green"
                >
                  <option value="">No milestone</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title} (Due: {milestone.dueDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-group justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary-green"
              >
                <span className="icon-spacing">🔄</span>
                Reset
              </button>
              <button
                type="submit"
                className="btn-primary-green"
              >
                <span className="icon-spacing">✅</span>
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTicket