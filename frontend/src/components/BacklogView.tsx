import { useState } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

interface BacklogViewProps {
  onNavigateToTicket?: (mode: 'edit', id: string) => void
}

type SortField = 'id' | 'status' | 'priority' | 'complexity' | 'title' | 'persona' | 'collabotator'
type SortOrder = 'asc' | 'desc'

export default function BacklogView({ onNavigateToTicket }: BacklogViewProps) {
  const { tickets, loading, error } = useTickets()
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedTickets = [...tickets].sort((a, b) => {
    let valueA: any = a[sortField] || ''
    let valueB: any = b[sortField] || ''

    if (sortField === 'priority') {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
      valueA = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0
      valueB = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0
    } else if (sortField === 'complexity') {
      const complexityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      valueA = complexityOrder[a.complexity?.toLowerCase() as keyof typeof complexityOrder] || 0
      valueB = complexityOrder[b.complexity?.toLowerCase() as keyof typeof complexityOrder] || 0
    } else {
      valueA = String(valueA).toLowerCase()
      valueB = String(valueB).toLowerCase()
    }

    if (sortOrder === 'desc') {
      return typeof valueA === 'number' ? valueB - valueA : valueB.localeCompare(valueA)
    } else {
      return typeof valueA === 'number' ? valueA - valueB : valueA.localeCompare(valueB)
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleRowClick = (ticket: Ticket) => {
    if (onNavigateToTicket && ticket.id) {
      onNavigateToTicket('edit', ticket.id)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortOrder === 'asc' ? '⬆️' : '⬇️'
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-green-100 text-green-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="text-lg text-gray-600">Loading backlog...</div></div>
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-600">{error}</p></div>
  }

  if (tickets.length === 0) {
    return <div className="text-center py-12"><div className="text-gray-500 text-lg">No tickets found</div></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">📋 Backlog ({tickets.length} tickets)</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { field: 'id' as SortField, label: 'ID' },
                { field: 'status' as SortField, label: 'Status' },
                { field: 'priority' as SortField, label: 'Priority' },
                { field: 'complexity' as SortField, label: 'Complexity' },
                { field: 'title' as SortField, label: 'Title' },
                { field: 'persona' as SortField, label: 'Persona' },
                { field: 'collabotator' as SortField, label: 'Collaborator' }
              ].map(({ field, label }) => (
                <th key={field} onClick={() => handleSort(field)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <span className="text-sm">{getSortIcon(field)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTickets.map((ticket) => (
              <tr key={ticket.id} onClick={() => handleRowClick(ticket)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status || 'open'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority || 'medium'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {ticket.complexity || 'medium'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{ticket.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.persona || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.collabotator || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
