import React from 'react'
import { useTickets } from '../context/TicketContext'
import TicketCard from './TicketCard'

const KanbanBoard = () => {
  const { tickets, moveTicket } = useTickets()

  const columns = [
    { id: 'todo', title: 'To Do', color: '#8b4513' },
    { id: 'in-progress', title: 'In Progress', color: '#7b9a3f' },
    { id: 'review', title: 'Review', color: '#5a6e5a' },
    { id: 'done', title: 'Done', color: '#4a7c59' }
  ]

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const handleMoveTicket = (ticketId, newStatus) => {
    moveTicket(ticketId, newStatus)
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
                    <span className="icon-spacing">{
                      column.id === 'todo' ? '📝' :
                      column.id === 'in-progress' ? '🔄' :
                      column.id === 'review' ? '👀' :
                      '✅'
                    }</span>
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
                          
                          const getColumnIcon = (colId) => {
                            switch (colId) {
                              case 'todo': return '📝'
                              case 'in-progress': return '🔄'
                              case 'review': return '👀'
                              case 'done': return '✅'
                              default: return '📌'
                            }
                          }
                          
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

export default KanbanBoard