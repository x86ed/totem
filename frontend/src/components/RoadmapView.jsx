import React from 'react'
import { useTickets } from '../context/TicketContext'

const RoadmapView = () => {
  const { tickets, milestones } = useTickets()

  const getTicketsByMilestone = (milestoneId) => {
    return tickets.filter(ticket => ticket.milestone === milestoneId)
  }

  const getMilestoneProgress = (milestoneId) => {
    const milestoneTickets = getTicketsByMilestone(milestoneId)
    if (milestoneTickets.length === 0) return 0
    
    const completedTickets = milestoneTickets.filter(ticket => ticket.status === 'done')
    return Math.round((completedTickets.length / milestoneTickets.length) * 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="page-container">
      <div className="flex items-center mb-6">
        <span className="icon-spacing text-2xl">🗺️</span>
        <h2 className="section-title">
          Project Roadmap
        </h2>
      </div>

      <div className="space-y-8">
        {milestones.map((milestone) => {
          const milestoneTickets = getTicketsByMilestone(milestone.id)
          const progress = getMilestoneProgress(milestone.id)
          
          return (
            <div key={milestone.id} className="milestone-green">
              <div className="milestone-header">
                <div>
                  <h3 className="milestone-title">
                    <span className="icon-spacing">🏁</span>
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
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        ticket.status === 'done' ? 'milestone-ticket completed' : 
                        ticket.status === 'in-progress' ? 'milestone-ticket in-progress' : 
                        'milestone-ticket'
                      }`}
                      style={{
                        background: ticket.status === 'done' ? '#f0f8f0' : 
                                   ticket.status === 'in-progress' ? '#f5f8f2' : '#f9fbf9',
                        borderLeft: `4px solid ${
                          ticket.status === 'done' ? '#4a7c59' : 
                          ticket.status === 'in-progress' ? '#7b9a3f' : '#c8d5c8'
                        }`
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={ticket.status === 'done'} 
                        readOnly
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <strong style={{ color: '#2d3e2e' }}>{ticket.title}</strong>
                          <span className="text-sm" style={{ color: '#5a6e5a' }}>({ticket.id})</span>
                          <span 
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              ticket.priority === 'high' ? 'priority-high-green' :
                              ticket.priority === 'medium' ? 'priority-medium-green' :
                              'priority-low-green'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="text-sm mt-1" style={{ color: '#5a6e5a' }}>
                          {ticket.description}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8" style={{ color: '#5a6e5a', fontStyle: 'italic' }}>
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