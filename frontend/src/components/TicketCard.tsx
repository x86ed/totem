import React from 'react'
import { Ticket } from '../types'
import Avatar from "boring-avatars";
import { TotemIcon } from './TotemIcon'
/**
 * Props interface for the TicketCard component
 * @interface TicketCardProps
 */
interface TicketCardProps {
  ticket: Ticket;
  columns?: { id: string; title: string; color: string }[];
  currentColumnId?: string;
  handleDragStart?: (ticketId: string) => void;
  handleDragEnd?: () => void;
  handleMoveTicket?: (ticketId: string, newStatus: string) => void;
  getColumnIcon?: (colId: string) => string;
  onClick?: () => void;
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
 * - Assignee/contributor information
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
const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  columns,
  currentColumnId,
  handleDragStart,
  handleDragEnd,
  handleMoveTicket,
  getColumnIcon,
  onClick,
}) => {
  /**
   * Gets the appropriate CSS class for a ticket priority
   * @param {Ticket['priority']} priority - The priority level of the ticket
   * @returns {string} CSS class name for styling the priority badge
   */
  // Return a background color for the card based on priority
  const getPriorityBg = (priority: Ticket['priority']): string => {
    switch (priority) {
      case 'high':
        return '#ffb4b4'; // light red
      case 'medium':
        return '#ffe9b4'; // light yellow
      case 'low':
      default:
        return '#d4f7c5'; // light green
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
    <div
      className="relative group ticket-green"
      style={{
        background: getPriorityBg(ticket.priority),
        border: `0.5em solid ${getPriorityBg(ticket.priority)}`,
        position: 'relative',
        minHeight: 120,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
      }}
      draggable={!!handleDragStart}
      onDragStart={handleDragStart ? () => handleDragStart(ticket.id) : undefined}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      {/* Ticket title at the top */}
      <h4 className="ticket-title line-clamp-2" style={{ margin: '45px 0 4px 0', fontSize: '.92em', fontWeight: 700 }}>
        {ticket.title}
      </h4>

      {/* Ticket ID directly below title */}
      <div className="ticket-id" style={{ fontWeight: 600, opacity: 0.5, fontSize: 12, marginBottom: 4 }}>
        {ticket.id}
      </div>

      {/* Top row: TotemIcon left, ticket-meta right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 4,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.7)',
          padding: '8px 12px',
        }}
      >
        <TotemIcon seed={ticket.id} size={3} showControls={false} />
        <div className="ticket-meta" style={{ display: 'flex', alignItems: 'center', gap: 12 , fontSize: '.75em'}}>
          {/* Assignee/Contributor */}
          {ticket.contributor && (
            <span className="px-2 py-1 text-xs" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar
                size={20}
                name={ticket.contributor}
                variant="pixel"
                colors={["#FFDD00", "#FFAB00", "#FF6F00", "#D50000", "#6200EA"]}
                square
              />
              {ticket.contributor}
            </span>
          )}
          {/* Persona */}
          {ticket.persona && (
            <span className="px-2 py-1 text-xs" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1d4ed8', fontWeight: 500 }}>
              <Avatar
                size={20}
                name={ticket.persona}
                variant="pixel"
                colors={["#A5B4FC", "#6366F1", "#818CF8", "#3730A3", "#C7D2FE"]}
                square
              />
              {ticket.persona}
            </span>
          )}
        </div>
      </div>

      {/* Priority icon and text in upper right */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.85)',
          padding: '2px 8px',
          fontWeight: 700,
          fontSize: 14,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 18 }}>{getPriorityIcon(ticket.priority)}</span>
        <span
          style={{ letterSpacing: 1 }}
          className={
            ticket.priority === 'high'
              ? 'priority-high-green'
              : ticket.priority === 'medium'
              ? 'priority-medium-green'
              : 'priority-low-green'
          }
        >
          {ticket.priority.toUpperCase()}
        </span>
      </div>

      <p className="ticket-description line-clamp-3" style={{ fontSize: 14, marginBottom: 12 }}>
        {ticket.description}
      </p>

      {/* Move ticket buttons at the very bottom of the card */}
      {columns && handleMoveTicket && getColumnIcon && currentColumnId && (
        <div className="flex space-x-1 mt-4 justify-end nav-buttons">
          {columns.map((targetColumn) => (
            targetColumn.id === ticket.status ? null : (
              <button
                key={targetColumn.id}
                onClick={() => handleMoveTicket(ticket.id, targetColumn.id)}
                className="bg-white border rounded p-1 text-xs hover:bg-gray-50 shadow-sm"
                style={{
                  borderColor: '#c8d5c8',
                  background: '#fafbfa',
                }}
                title={`Move to ${targetColumn.title}`}
                aria-label={`Move to ${targetColumn.title}`}
              >
                {getColumnIcon(targetColumn.id)}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Default export of the TicketCard component
 * @default TicketCard
 */
export default TicketCard
