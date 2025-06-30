import React from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'
import TicketCard from './TicketCard'

/**
 * Column interface representing a kanban board status column
 * @interface Column
 */
interface Column {
  /** The status ID that matches a ticket's status property */
  id: Ticket['status']
  /** Display title for the column */
  title: string
  /** Color hex code for the column */
  color: string
}

/**
 * KanbanBoard Component
 * 
 * A flexible Kanban board implementation for the project management system.
 * Displays tickets organized by status in columns, with drag-and-drop functionality
 * for moving tickets between statuses.
 * 
 * Features:
 * - Status columns (To Do, In Progress, Review, Done)
 * - Visual ticket cards with detailed information
 * - Hover controls to move tickets between statuses
 * - Ticket count per column
 * - Empty state indicators
 * - Color-coded columns
 * 
 * @component
 * @returns {JSX.Element} The KanbanBoard component with columns and tickets
 * 
 * @example
 * ```tsx
 * import KanbanBoard from './components/KanbanBoard'
 * 
 * function App() {
 *   return (
 *     <div>
 *       <KanbanBoard />
 *     </div>
 *   )
 * }
 * ```
 */
const KanbanBoard: React.FC = () => {
  const { tickets, moveTicket } = useTickets()

  const columns: Column[] = [
    { id: 'todo', title: 'To Do', color: '#8b4513' },
    { id: 'in-progress', title: 'In Progress', color: '#7b9a3f' },
    { id: 'review', title: 'Review', color: '#5a6e5a' },
    { id: 'done', title: 'Done', color: '#4a7c59' }
  ]

  /**
   * Filters tickets by their status
   * @param {Ticket['status']} status - The status to filter by
   * @returns {Ticket[]} Array of tickets with the matching status
   */
  const getTicketsByStatus = (status: Ticket['status']): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status)
  }

  /**
   * Moves a ticket to a different status column
   * @param {string} ticketId - The ID of the ticket to move
   * @param {Ticket['status']} newStatus - The destination status
   */
  const handleMoveTicket = (ticketId: string, newStatus: Ticket['status']): void => {
    moveTicket(ticketId, newStatus)
  }

  /**
   * Gets the appropriate icon for a column based on its status ID
   * @param {Ticket['status']} colId - The column status ID
   * @returns {string} Emoji icon representing the column status
   */
  const getColumnIcon = (colId: Ticket['status']): string => {
    switch (colId) {
      case 'todo': return '📝'
      case 'in-progress': return '🔄'
      case 'review': return '👀'
      case 'done': return '✅'
      default: return '📌'
    }
  }

  return (
    <div className="page-container">
      <div className="grid-responsive">
        {columns.map((column) => {
          const columnTickets = getTicketsByStatus(column.id)
          return (
            <div key={column.id} className="column-green">
              <div className="column-header">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" style={{ color: '#2d3e2e' }}>
                    <span className="icon-spacing">{getColumnIcon(column.id)}</span>
                    {column.title}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ 
                      background: '#e6f0e6',
                      color: '#4a5d4a'
                    }}
                  >
                    {columnTickets.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {columnTickets.map((ticket) => (
                  <div key={ticket.id} className="relative group">
                    <TicketCard ticket={ticket} />
                    
                    {/* Move buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {columns.map((targetColumn) => {
                          if (targetColumn.id === ticket.status) return null
                          
                          return (
                            <button
                              key={targetColumn.id}
                              onClick={() => handleMoveTicket(ticket.id, targetColumn.id)}
                              className="bg-white border rounded p-1 text-xs hover:bg-gray-50 shadow-sm"
                              style={{ 
                                borderColor: '#c8d5c8',
                                background: '#fafbfa'
                              }}
                              title={`Move to ${targetColumn.title}`}
                            >
                              {getColumnIcon(targetColumn.id)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {columnTickets.length === 0 && (
                  <div className="text-center py-8" style={{ color: '#5a6e5a' }}>
                    <span className="icon-spacing">📂</span>
                    No tickets in this column
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

/**
 * Default export of the KanbanBoard component
 * @default KanbanBoard
 */
export default KanbanBoard
