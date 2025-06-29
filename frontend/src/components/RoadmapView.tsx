import React from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

const RoadmapView: React.FC = () => {
  const { tickets, milestones } = useTickets()

  const getTicketsByMilestone = (milestoneId: string): Ticket[] => {
    return tickets.filter(ticket => ticket.milestone === milestoneId)
  }

  const getMilestoneProgress = (milestoneId: string): number => {
    const milestoneTickets = getTicketsByMilestone(milestoneId)
    if (milestoneTickets.length === 0) return 0
    
    const completedTickets = milestoneTickets.filter(ticket => ticket.status === 'done')
    return Math.round((completedTickets.length / milestoneTickets.length) * 100)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityClass = (priority: Ticket['priority']): string => {
    switch (priority) {
      case 'high':
        return 'priority-high-green'
      case 'medium':
        return 'priority-medium-green'
      case 'low':
        return 'priority-low-green'
      default:
        return 'priority-low-green'
    }
  }

  const getStatusIcon = (status: Ticket['status']): string => {
    switch (status) {
      case 'done':
        return '✅'
      case 'in-progress':
        return '🔄'
      case 'review':
        return '👀'
      case 'todo':
      default:
        return '📝'
    }
  }

  return (
    <div className="page-container">
      <h2 className="section-title">
        <span className="icon-spacing">🗺️</span>
        Project Roadmap
      </h2>

      <div className="space-y-8">
        {milestones.map((milestone) => {
          const milestoneTickets = getTicketsByMilestone(milestone.id)
          const progress = getMilestoneProgress(milestone.id)
          
          return (
            <div key={milestone.id} className="milestone-green">
              <div className="milestone-header">
                <div>
                  <h3 className="milestone-title">
                    <span className="icon-spacing">🎯</span>
                    {milestone.title}
                  </h3>
                  <p className="milestone-description">
                    {milestone.description}
                  </p>
                </div>
                <div className="milestone-date-green">
                  <span className="icon-spacing">📅</span>
                  {formatDate(milestone.dueDate)}
                </div>
              </div>

              {/* Progress section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#2d3e2e' }}>
                    <span className="icon-spacing">📊</span>
                    Progress: {progress}% ({milestoneTickets.filter(t => t.status === 'done').length}/{milestoneTickets.length} completed)
                  </span>
                </div>
                <div className="progress-bar-green">
                  <div 
                    className="progress-fill-green"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Tickets list */}
              <div className="space-y-3">
                <h4 className="font-medium" style={{ color: '#2d3e2e' }}>
                  <span className="icon-spacing">🎫</span>
                  Tickets ({milestoneTickets.length})
                </h4>
                {milestoneTickets.length > 0 ? (
                  milestoneTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="milestone-ticket"
                      style={{
                        background: ticket.status === 'done' ? '#f0f8f0' : 
                                   ticket.status === 'in-progress' ? '#f5f8f2' : '#f9fbf9',
                        borderLeft: `4px solid ${
                          ticket.status === 'done' ? '#4a7c59' : 
                          ticket.status === 'in-progress' ? '#7b9a3f' : '#c8d5c8'
                        }`
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg">{getStatusIcon(ticket.status)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <strong style={{ color: '#2d3e2e' }}>{ticket.title}</strong>
                            <span className="text-sm" style={{ color: '#5a6e5a' }}>({ticket.id})</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <div className="text-sm" style={{ color: '#5a6e5a' }}>
                            {ticket.description}
                          </div>
                          {ticket.assignee && (
                            <div className="text-xs mt-1" style={{ color: '#7a8e7a' }}>
                              <span className="icon-spacing">👤</span>
                              Assigned to: {ticket.assignee}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8" style={{ color: '#5a6e5a', fontStyle: 'italic' }}>
                    <span className="icon-spacing">📂</span>
                    No tickets assigned to this milestone
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoadmapView
