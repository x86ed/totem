import React from 'react';
// Types for filter data
interface StatusOption { key: string; label?: string; }
interface PriorityOption { key: string; label?: string; }
interface ComplexityOption { key: string; label?: string; }
interface PersonaOption { name: string; }
interface ContributorOption { name: string; }

interface CollapsibleFilterBarProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  status: { statuses: StatusOption[] };
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  priority: { priorities: PriorityOption[] };
  complexityFilter: string;
  setComplexityFilter: (v: string) => void;
  complexities: { complexities: ComplexityOption[] };
  personaFilter: string;
  setPersonaFilter: (v: string) => void;
  personas: PersonaOption[];
  contributorFilter: string;
  setContributorFilter: (v: string) => void;
  contributors: ContributorOption[];
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  page: number;
  setPage: (n: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  totalFiltered: number;
}

const CollapsibleFilterBar: React.FC<CollapsibleFilterBarProps> = ({
  statusFilter, setStatusFilter, status,
  priorityFilter, setPriorityFilter, priority,
  complexityFilter, setComplexityFilter, complexities,
  personaFilter, setPersonaFilter, personas,
  contributorFilter, setContributorFilter, contributors,
  hasActiveFilters, clearAllFilters,
  page, setPage, pageSize, setPageSize, totalFiltered
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));


  // Modern, visually appealing styles
  return (
    <div className="bg-gradient-to-r from-green-50 to-gray-100 border-b border-gray-200 px-6 py-2 flex flex-col rounded-t-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            className="text-xs text-green-700 hover:text-green-900 font-semibold focus:outline-none transition-colors"
            onClick={() => setCollapsed((c: boolean) => !c)}
            aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
          >
            {collapsed ? 'Show Filters' : 'Hide Filters'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-green-600 hover:text-green-800 font-medium ml-2 border border-green-200 rounded px-2 py-1 bg-white/80 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-2 py-1 rounded border border-gray-300 bg-white/80 text-xs shadow-sm hover:bg-green-50 transition-colors"
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </button>
          <span className="text-xs font-medium text-gray-700">Page {page} of {totalPages}</span>
          <button
            className="px-2 py-1 rounded border border-gray-300 bg-white/80 text-xs shadow-sm hover:bg-green-50 transition-colors"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
          <span className="text-xs text-gray-700">Rows per page:</span>
          <select
            className="border rounded px-2 py-1 text-xs bg-white/80 focus:ring-green-500 focus:border-green-500"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      {!collapsed && (
        <div className="flex gap-4 items-end mt-1 overflow-x-auto pb-2">
          <div className="min-w-[140px] flex-row ">
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white/90"
            >
              <option value="">All</option>
              {status?.statuses.map((status: StatusOption) => (
                <option key={status.key} value={status.key.toLowerCase()}>{status.label || status.key.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-row ">
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white/90"
            >
              <option value="">All</option>
              {priority?.priorities.map((priority: PriorityOption) => (
                <option key={priority.key} value={priority.key.toLowerCase()}>{priority.label || priority.key.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-row ">
            <label className="block text-xs font-medium text-gray-700 mb-1">Complexity</label>
            <select
              value={complexityFilter}
              onChange={e => { setComplexityFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white/90"
            >
              <option value="">All</option>
              {complexities?.complexities.map((item: ComplexityOption) => (
                <option key={item.key} value={item.key}>{item.key}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Persona</label>
            <select
              value={personaFilter}
              onChange={e => { setPersonaFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white/90"
            >
              <option value="">All</option>
              {personas.map((persona: PersonaOption) => (
                <option key={persona.name} value={persona.name}>{persona.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Contributor</label>
            <select
              value={contributorFilter}
              onChange={e => { setContributorFilter(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white/90"
            >
              <option value="">All</option>
              {contributors.map((contributor: ContributorOption) => (
                <option key={contributor.name} value={contributor.name}>{contributor.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleFilterBar;
