import React from 'react'
import { Ticket } from '../types'

/**
 * Props interface for the TicketCard component
 * @interface TicketCardProps
 */
interface TicketCardProps {
  /** The ticket object containing all ticket data */
  ticket: Ticket
}

/**
 * TicketCard Component
 * 
 * A reusable card component for displaying individual ticket information.
 * Used across the application in different views (Kanban board, Roadmap, etc.)
 * 
 * Features:
 * - Visual representation of ticket details
 * - Priority indicators with color coding
 * - Assignee information
 * - Ticket ID and title display
 * - Truncated description with line clamping
 * 
 * @component
 * @param {TicketCardProps} props - Component props
 * @param {Ticket} props.ticket - The ticket object to display
 * @returns {JSX.Element} The TicketCard component
 * 
 * @example
 * ```tsx
 * import TicketCard from './components/TicketCard'
 * 
 * function TicketList({ tickets }) {
 *   return (
 *     <div>
 *       {tickets.map(ticket => (
 *         <TicketCard key={ticket.id} ticket={ticket} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  /**
   * Gets the appropriate CSS class for a ticket priority
   * @param {Ticket['priority']} priority - The priority level of the ticket
   * @returns {string} CSS class name for styling the priority badge
   */
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

  /**
   * Gets the appropriate emoji icon for a ticket priority
   * @param {Ticket['priority']} priority - The priority level of the ticket
   * @returns {string} Emoji icon representing the priority level
   */
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

/**
 * Default export of the TicketCard component
 * @default TicketCard
 */
export default TicketCard
