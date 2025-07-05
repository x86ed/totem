import { useState } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

interface BacklogViewProps {
  onNavigateToTicket?: (mode: 'edit', id: string) => void
}

type SortField = 'id' | 'status' | 'priority' | 'complexity' | 'title' | 'persona'
type SortOrder = 'asc' | 'desc'

function BacklogView({ onNavigateToTicket }: BacklogViewProps) {
  const { tickets, loading, error } = useTickets()
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedTickets = [...tickets].sort((a, b) => {
    let valueA: string | number
    let valueB: string | number

    if (sortField === 'priority') {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      valueA = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0
      valueB = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0
    } else if (sortField === 'complexity') {
      const complexityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      valueA = complexityOrder[a.complexity?.toLowerCase() as keyof typeof complexityOrder] || 0
      valueB = complexityOrder[b.complexity?.toLowerCase() as keyof typeof complexityOrder] || 0
    } else {
      valueA = String(a[sortField] || '').toLowerCase()
      valueB = String(b[sortField] || '').toLowerCase()
    }

    if (sortOrder === 'desc') {
      return typeof valueA === 'number' && typeof valueB === 'number' 
        ? valueB - valueA 
        : String(valueB).localeCompare(String(valueA))
    } else {
      return typeof valueA === 'number' && typeof valueB === 'number' 
        ? valueA - valueB 
        : String(valueA).localeCompare(String(valueB))
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // For priority, default to descending (high priority first)
      setSortOrder(field === 'priority' ? 'desc' : 'asc')
    }
  }

  const handleRowClick = (ticket: Ticket) => {
    if (onNavigateToTicket && ticket.id) {
      onNavigateToTicket('edit', ticket.id)
    } else if (ticket.id) {
      // For demo purposes, we'll just log the ticket ID
      // In a full app, this could use hash navigation or state management
      console.log('Edit ticket:', ticket.id)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortOrder === 'asc' ? '⬆️' : '⬇️'
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
      case 'high': return 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'
      case 'medium': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm'
      case 'low': return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
      case 'in-progress': return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
      case 'planning': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
      case 'done': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
      case 'blocked': return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm'
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-sm'
      case 'medium': return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm'
      case 'low': return 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-sm'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '🚨'
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '🌱'
      default: return '➖'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return '🆕'
      case 'in-progress': return '⚡'
      case 'planning': return '📋'
      case 'completed': return '✅'
      case 'done': return '✅'
      case 'blocked': return '🚫'
      default: return '❓'
    }
  }

  const getStatusDisplay = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'OPEN'
      case 'in-progress': return 'IN PROGRESS'
      case 'planning': return 'PLANNING'
      case 'completed': return 'COMPLETED'
      default: return status?.toUpperCase() || 'OPEN'
    }
  }

  const getPriorityDisplay = (priority?: string) => {
    return priority?.toUpperCase() || 'MEDIUM'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600 font-medium">Loading tickets...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
        <div className="flex items-center">
          <span className="text-2xl mr-3">❌</span>
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Tickets</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-gray-500 text-xl font-medium">No tickets found</div>
        <div className="text-gray-400 text-sm mt-2">Create your first ticket to get started</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Backlog
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} • Sortable table view
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <div className="text-right">
              <div className="text-2xl font-bold">{tickets.length}</div>
              <div className="text-xs uppercase tracking-wide">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {[
                { field: 'id' as SortField, label: 'ID', icon: '🏷️' },
                { field: 'status' as SortField, label: 'Status', icon: '📊' },
                { field: 'priority' as SortField, label: 'Priority', icon: '⚠️' },
                { field: 'complexity' as SortField, label: 'Complexity', icon: '🧩' },
                { field: 'title' as SortField, label: 'Title', icon: '📝' },
                { field: 'persona' as SortField, label: 'Persona', icon: '👤' }
              ].map(({ field, label, icon }) => (
                <th 
                  key={field} 
                  onClick={() => handleSort(field)} 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 select-none"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{icon}</span>
                    <span>{label}</span>
                    <span className="text-lg transition-transform duration-200 hover:scale-110">
                      {getSortIcon(field)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedTickets.map((ticket, index) => (
              <tr 
                key={ticket.id} 
                onClick={() => handleRowClick(ticket)} 
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🏷️</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                      {ticket.id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusColor(ticket.status)} transform transition-transform hover:scale-105`}>
                    <span className="mr-1.5">{getStatusIcon(ticket.status)}</span>
                    {getStatusDisplay(ticket.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${getPriorityColor(ticket.priority)} transform transition-transform hover:scale-105`}>
                    <span className="mr-1.5">{getPriorityIcon(ticket.priority)}</span>
                    {getPriorityDisplay(ticket.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${getComplexityColor(ticket.complexity)} transform transition-transform hover:scale-105`}>
                    <span className="mr-1.5">🧩</span>
                    {(ticket.complexity || 'medium').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <span className="text-lg mr-2 mt-0.5">📝</span>
                    <div className="max-w-xs">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                        {ticket.title}
                      </div>
                      {ticket.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {ticket.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👤</span>
                    <span className="text-sm text-gray-600 font-medium">
                      {ticket.persona || (
                        <span className="text-gray-400 italic">No persona</span>
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="text-blue-500 mr-1">📊</span>
              Showing {sortedTickets.length} tickets
            </span>
            <span className="flex items-center">
              <span className="text-purple-500 mr-1">🔄</span>
              Sorted by {sortField} ({sortOrder})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Click any row to view details
          </div>
        </div>
      </div>
    </div>
  )
}
export default BacklogView