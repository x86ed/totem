import { useState } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

interface BacklogViewProps {
  onNavigateToTicket?: (mode: 'edit' | 'view', id: string) => void
}

type SortField = 'id' | 'status' | 'priority' | 'complexity' | 'title' | 'persona' | 'contributor'
type SortOrder = 'asc' | 'desc'

function BacklogView({ onNavigateToTicket }: BacklogViewProps) {
  const { tickets, loading, error } = useTickets()
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [complexityFilter, setComplexityFilter] = useState<string>('')
  const [personaFilter, setPersonaFilter] = useState<string>('')
  const [contributorFilter, setContributorFilter] = useState<string>('')

  // Apply filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = !statusFilter || ticket.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority = !priorityFilter || ticket.priority?.toLowerCase() === priorityFilter.toLowerCase()
    const matchesComplexity = !complexityFilter || ticket.complexity?.toLowerCase() === complexityFilter.toLowerCase()
    const matchesPersona = !personaFilter || ticket.persona?.toLowerCase().includes(personaFilter.toLowerCase())
    const matchesContributor = !contributorFilter || ticket.contributor?.toLowerCase().includes(contributorFilter.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesComplexity && matchesPersona && matchesContributor
  })

  const clearAllFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setComplexityFilter('')
    setPersonaFilter('')
    setContributorFilter('')
  }

  const hasActiveFilters = statusFilter || priorityFilter || complexityFilter || personaFilter || contributorFilter

  const sortedTickets = [...filteredTickets].sort((a, b) => {
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
      setSortOrder(field === 'priority' ? 'desc' : 'asc')
    }
  }

  const handleRowClick = (ticket: Ticket) => {
    if (onNavigateToTicket && ticket.id) {
      onNavigateToTicket('view', ticket.id)
    } else if (ticket.id) {
      console.log('View ticket:', ticket.id)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅'
    return sortOrder === 'asc' ? '⇈' : '⇊'
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-open'
      case 'in-progress': return 'status-in-progress'
      case 'planning': return 'status-planning'
      case 'completed': return 'status-completed'
      case 'done': return 'status-done'
      case 'blocked': return 'status-blocked'
      default: return 'status-default'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'priority-critical'
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-default'
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case 'high': return 'complexity-high'
      case 'medium': return 'complexity-medium'
      case 'low': return 'complexity-low'
      default: return 'complexity-default'
    }
  }

  const getStatusDisplay = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'OPEN'
      case 'in-progress': return 'IN PROGRESS'
      case 'planning': return 'PLANNING'
      case 'completed': return 'DONE'
      case 'done': return 'DONE'
      case 'blocked': return 'BLOCKED'
      default: return status?.toUpperCase() || 'OPEN'
    }
  }

  const getPriorityDisplay = (priority?: string) => {
    return priority?.toUpperCase() || 'MEDIUM'
  }

  const getComplexityDisplay = (complexity?: string) => {
    return complexity?.toUpperCase() || 'MEDIUM'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <div className="text-lg text-gray-600 font-medium">Loading tickets...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-red-400">⚠</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Tickets</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-xl font-medium">No tickets found</div>
        <div className="text-gray-400 text-sm mt-2">Create your first ticket to get started</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Backlog</h2>
          <div className="bg-green-600 rounded px-3 py-1 text-sm font-medium">
            {filteredTickets.length} {filteredTickets.length !== tickets.length ? 'filtered' : 'total'}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Complexity</label>
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Persona</label>
            <input
              type="text"
              placeholder="Filter by persona..."
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contributor</label>
            <input
              type="text"
              placeholder="Filter by contributor..."
              value={contributorFilter}
              onChange={(e) => setContributorFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3">
            <button
              onClick={clearAllFilters}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="backlog-table min-w-full divide-y divide-gray-200">
          <thead className="bg-green-700">
            <tr>
              {[
                { field: 'id' as SortField, label: 'ID' },
                { field: 'status' as SortField, label: 'Status' },
                { field: 'priority' as SortField, label: 'Priority' },
                { field: 'complexity' as SortField, label: 'Complexity' },
                { field: 'title' as SortField, label: 'Title' },
                { field: 'persona' as SortField, label: 'Persona' },
                { field: 'contributor' as SortField, label: 'Contributor' }
              ].map(({ field, label }) => (
                <th 
                  key={field} 
                  onClick={() => handleSort(field)} 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-green-600 transition-colors select-none"
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    <span className="text-sm">{getSortIcon(field)}</span>
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
                className={`hover:bg-green-50 cursor-pointer transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {ticket.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block rounded ${getStatusColor(ticket.status)}`}>
                    {getStatusDisplay(ticket.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block rounded ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityDisplay(ticket.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block rounded ${getComplexityColor(ticket.complexity)}`}>
                    {getComplexityDisplay(ticket.complexity)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {ticket.title}
                  </div>
                  {ticket.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {ticket.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {ticket.persona || <span className="text-gray-400 italic">No persona</span>}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {ticket.contributor || <span className="text-gray-400 italic">No contributor</span>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="bg-green-700 px-6 py-3 border-t border-green-600">
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center space-x-4">
            <span>
              Showing {sortedTickets.length} tickets
              {filteredTickets.length !== tickets.length && ` (filtered from ${tickets.length})`}
            </span>
            <span>
              Sorted by {sortField} ({sortOrder})
            </span>
          </div>
          <div className="text-xs text-green-100">
            Click any row to view details
          </div>
        </div>
      </div>
    </div>
  )
}

export default BacklogView