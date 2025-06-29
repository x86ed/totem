import React from 'react'
import { Ticket } from '../types'

interface TicketCardProps {
  ticket: Ticket
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
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

  const getPriorityIcon = (priority: Ticket['priority']): string => {
    switch (priority) {
      case 'high':
        return '🔥'
      case 'medium':
        return '⚡'
      case 'low':
        return '🟢'
      default:
        return '🟢'
    }
  }

  return (
    <div className="ticket-green">
      <div className="ticket-id">
        <span className="icon-spacing">🎫</span>
        {ticket.id}
      </div>

      <h4 className="ticket-title line-clamp-2">
        {ticket.title}
      </h4>

      <p className="ticket-description line-clamp-3">
        {ticket.description}
      </p>

      <div className="ticket-meta">
        <span className={`${getPriorityClass(ticket.priority)} px-2 py-1 rounded text-xs font-medium`}>
          <span className="icon-spacing">
            {getPriorityIcon(ticket.priority)}
          </span>
          {ticket.priority.toUpperCase()}
        </span>
        {ticket.assignee && (
          <span className="assignee-green px-2 py-1 rounded text-xs">
            <span className="icon-spacing">👤</span>
            {ticket.assignee}
          </span>
        )}
      </div>
    </div>
  )
}

export default TicketCard
