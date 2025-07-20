import { useState, useEffect } from 'react'
import { useContributors } from '../context/ContributorContext'
import { useContext } from 'react'
import { ComplexityContext } from '../context/ComplexityContext'
import { usePersonas } from '../context/PersonaContext'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'
import { TotemIcon } from './TotemIcon'
import { StatusContext } from '../context/StatusContext'
import { PriorityContext } from '../context/PriorityContext'
import CollapsibleFilterBar from './CollapsibleFilterBar'

interface BacklogViewProps {
  onNavigateToTicket?: (mode: 'edit' | 'view', id: string) => void
}

type SortField = 'id' | 'status' | 'priority' | 'complexity' | 'title' | 'persona' | 'contributor'
type SortOrder = 'asc' | 'desc'



function BacklogView({ onNavigateToTicket }: BacklogViewProps) {
  const { tickets, loading, error, refreshTickets, pagination, setPagination, filters, setFilters, sort, setSort } = useTickets();
  const [sortField, setSortField] = useState<SortField>(sort.field as SortField || 'id');
  const [sortOrder, setSortOrder] = useState<SortOrder>(sort.order as SortOrder || 'asc');

  // Pagination state
  const [page, setPage] = useState(() => Math.floor((pagination.offset || 0) / (pagination.limit || 20)) + 1);
  const [pageSize, setPageSize] = useState(pagination.limit || 20);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || '');
  const status = useContext(StatusContext) || { statuses: [] };
  const [priorityFilter, setPriorityFilter] = useState<string>(filters.priority || '');
  const priority = useContext(PriorityContext) || { priorities: [] };
  const [complexityFilter, setComplexityFilter] = useState<string>(filters.complexity || '');
  const complexities = useContext(ComplexityContext) || { complexities: [] };
  const [personaFilter, setPersonaFilter] = useState<string>(filters.persona || '');
  const { personas } = usePersonas();
  const [contributorFilter, setContributorFilter] = useState<string>(filters.contributor || '');
  const { contributors } = useContributors();

  // Sync context state when local state changes
  useEffect(() => {
    setFilters({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      complexity: complexityFilter || undefined,
      persona: personaFilter || undefined,
      contributor: contributorFilter || undefined,
    });
  }, [statusFilter, priorityFilter, complexityFilter, personaFilter, contributorFilter, setFilters]);

  useEffect(() => {
    setPagination({
      ...pagination,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }, [page, pageSize, setPagination]);

  useEffect(() => {
    setSort({ field: sortField, order: sortOrder });
  }, [sortField, sortOrder, setSort]);

  // Effect: fetch tickets when filters, page, pageSize, or sort changes
  useEffect(() => {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    refreshTickets({
      offset,
      limit,
      filters: {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        complexity: complexityFilter || undefined,
        persona: personaFilter || undefined,
        contributor: contributorFilter || undefined,
      },
      sort: { field: sortField, order: sortOrder },
    });
    // eslint-disable-next-line
  }, [statusFilter, priorityFilter, complexityFilter, personaFilter, contributorFilter, page, pageSize, sortField, sortOrder]);

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setComplexityFilter('');
    setPersonaFilter('');
    setContributorFilter('');
    setPage(1);
    setFilters({});
  };

  const hasActiveFilters = Boolean(statusFilter || priorityFilter || complexityFilter || personaFilter || contributorFilter);


  // No client-side sorting or filtering; tickets are already filtered/sorted from server
  const sortedTickets = tickets;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'priority' ? 'desc' : 'asc');
    }
    setSort({ field, order: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

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
      case 'xxl': return 'complexity-high'
      case 'xl': return 'complexity-high'
      case 'l': return 'complexity-medium'
      case 's': return 'complexity-low'
      case 'xs': return 'complexity-low'
      default: return 'complexity-medium'
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
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Backlog</h2>
          <div className="bg-green-600 rounded px-3 py-1 text-sm font-medium">
            {pagination?.totalFiltered ?? 0} total
          </div>
        </div>
      </div>

      {/* Collapsible Filter & Pagination Bar */}
      <CollapsibleFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        status={status}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        priority={priority}
        complexityFilter={complexityFilter}
        setComplexityFilter={setComplexityFilter}
        complexities={complexities}
        personaFilter={personaFilter}
        setPersonaFilter={setPersonaFilter}
        personas={personas}
        contributorFilter={contributorFilter}
        setContributorFilter={setContributorFilter}
        contributors={contributors}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalFiltered={pagination?.totalFiltered ?? 0}
      />

      {/* Empty State */}
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 m-8">
        <div className="text-gray-500 text-xl font-medium">No tickets found</div>
        <div className="text-gray-400 text-sm mt-2">Create your first ticket to get started</div>
      </div>
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
            {pagination?.totalFiltered ?? sortedTickets.length} total
          </div>
        </div>
      </div>

      {/* Collapsible Filter & Pagination Bar */}
      <CollapsibleFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        status={status}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        priority={priority}
        complexityFilter={complexityFilter}
        setComplexityFilter={setComplexityFilter}
        complexities={complexities}
        personaFilter={personaFilter}
        setPersonaFilter={setPersonaFilter}
        personas={personas}
        contributorFilter={contributorFilter}
        setContributorFilter={setContributorFilter}
        contributors={contributors}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalFiltered={pagination?.totalFiltered ?? sortedTickets.length}
      />

      {/* Table */}
      <div className="overflow-hidden">
        <table className="backlog-table w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-green-700">
            <tr>
              <th
                style={{
                  width: '56px', minWidth: '56px', maxWidth: '56px', padding: 0, border: 'none',
                }}
                className="text-center"
              />
              {[
                { field: 'id' as SortField, label: 'ID', width: '80px' },
                { field: 'status' as SortField, label: 'Status', width: '90px' },
                { field: 'priority' as SortField, label: 'Priority', width: '80px' },
                { field: 'complexity' as SortField, label: 'Complexity', width: '90px' },
                { field: 'title' as SortField, label: 'Title', width: 'auto' },
                { field: 'persona' as SortField, label: 'Persona', width: '100px' },
                { field: 'contributor' as SortField, label: 'Contributor', width: '120px' }
              ].map(({ field, label, width }) => (
                <th 
                  key={field} 
                  onClick={() => handleSort(field)} 
                  className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-green-600 transition-colors select-none"
                  style={{ width }}
                >
                  <div className="flex items-center space-x-1">
                    <span className="truncate">{label}</span>
                    <span className="text-sm flex-shrink-0">{getSortIcon(field)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedTickets.map((ticket) => (
              <tr key={ticket.id} onClick={() => handleRowClick(ticket)} style={{ cursor: 'pointer' }}>
                <td
                  style={{
                    width: '56px', minWidth: '56px', maxWidth: '56px', padding: 0, border: 'none', height: '56px',
                  }}
                  className="text-center align-middle"
                >
                  <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TotemIcon seed={ticket.id} size={1.75} showControls={false} />
                  </div>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-1 py-0.5 rounded">
                    {ticket.id}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded text-xs ${getStatusColor(ticket.status)}`}>
                    {getStatusDisplay(ticket.status)}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityDisplay(ticket.priority)}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded text-xs ${getComplexityColor(ticket.complexity)}`}>
                    {getComplexityDisplay(ticket.complexity)}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {ticket.title}
                  </div>
                  {ticket.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {ticket.description}
                    </div>
                  )}
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className="text-xs text-gray-600 truncate block" style={{ maxWidth: '100px' }}>
                    {ticket.persona || <span className="text-gray-400 italic">None</span>}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className="text-xs text-gray-600 truncate block" style={{ maxWidth: '120px' }}>
                    {ticket.contributor || <span className="text-gray-400 italic">None</span>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Pagination is now part of the filter bar above */}

      {/* Footer */}
      <div className="bg-green-700 px-6 py-3 border-t border-green-600">
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center space-x-4">
            <span>
              Showing {sortedTickets.length} tickets
              {pagination && pagination.totalFiltered !== undefined && ` (filtered from ${pagination.total || pagination.totalFiltered})`}
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