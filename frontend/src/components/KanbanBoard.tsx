import React from 'react';
import { useTickets } from '../context/TicketContext';
import { useContext } from 'react';
import { StatusContext } from '../context/StatusContext';
import { Ticket } from '../types';
import TicketCard from './TicketCard';

interface Column {
  id: string;
  title: string;
  color: string;
}

function KanbanBoard() {
  const { tickets, updateTicket, loadAllTickets, loading } = useTickets();
  const statusCtx = useContext(StatusContext);
  // Dynamically generate default columns from StatusContext if available, otherwise fallback
  let defaultColumns: Column[] = [];
  if (Array.isArray(statusCtx?.statuses) && statusCtx.statuses.length > 0) {
    defaultColumns = statusCtx.statuses.map((s, idx) => ({
      id: s.key,
      title: s.description || s.key,
      color: [
        '#8b4513', // brown
        '#7b9a3f', // olive
        '#5a6e5a', // green
        '#4a7c59', // teal
        '#c8d5c8', // light green
        '#e6f0e6', // pale
        '#4a5d4a', // dark
        '#fafbfa', // off white
      ][idx % 8]
    }));
  } else {
    defaultColumns = [
      { id: 'open', title: 'Open', color: '#8b4513' },
      { id: 'todo', title: 'Planning', color: '#7b9a3f' },
      { id: 'in-progress', title: 'In Progress', color: '#5a6e5a' },
      { id: 'done', title: 'Completed', color: '#4a7c59' }
    ];
  }
  const columns: Column[] = defaultColumns;

  // Load all tickets on mount
  React.useEffect(() => {
    loadAllTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Drag state
  const [draggedTicketId, setDraggedTicketId] = React.useState<string | null>(null);

  const getTicketsByStatus = (status: string): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  };

  // Drag handlers
  const handleDragStart = (ticketId: string) => {
    setDraggedTicketId(ticketId);
  };

  const handleDragEnd = () => {
    setDraggedTicketId(null);
  };

  const handleDrop = async (columnId: string) => {
    if (draggedTicketId) {
      await handleMoveTicket(draggedTicketId, columnId);
      setDraggedTicketId(null);
    }
  };

  const handleMoveTicket = async (ticketId: string, newStatus: string): Promise<void> => {
    const ticketToUpdate = tickets.find(ticket => ticket.id === ticketId);
    if (ticketToUpdate) {
      await updateTicket({ ...ticketToUpdate, status: newStatus });
    }
  };

  const getColumnIcon = (colId: string): string => {
    switch (colId) {
      case 'open': return '📝';
      case 'todo': return '🎯';
      case 'in-progress': return '🔄';
      case 'done': return '✅';
      case 'blocked': return '⛔';
      case 'review': return '🔍';
      case 'closed': return '🚫';
      default: return '📌';
    }
  };


  if (!columns || columns.length === 0) {
    return (
      <div className="page-container">
        <div className="text-center py-12 text-gray-500">No status columns available. Please configure statuses in project settings.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-12 text-gray-500">Loading tickets…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="grid-responsive">
        {columns.map((column) => {
          const columnTickets = getTicketsByStatus(column.id);
          return (
            <div
              key={column.id}
              className="column-green"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
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
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    columns={columns}
                    currentColumnId={column.id}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleMoveTicket={handleMoveTicket}
                    getColumnIcon={getColumnIcon}
                  />
                ))}
                {columnTickets.length === 0 && (
                  <div className="text-center py-8" style={{ color: '#5a6e5a' }}>
                    <span className="icon-spacing">📂</span>
                    No tickets in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanBoard;
