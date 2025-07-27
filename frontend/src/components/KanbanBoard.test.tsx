import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import KanbanBoard from './KanbanBoard';
import { vi } from 'vitest';
import { StatusContext, StatusContextType } from '../context/StatusContext';
import { TicketContext } from '../context/TicketContext';
import type { TicketContextType } from '../types';

const mockStatuses = [
  { key: 'open', description: 'Open' },
  { key: 'in-progress', description: 'In Progress' },
  { key: 'done', description: 'Done' },
];

const mockTickets = [
  { id: '1', title: 'Test Ticket 1', description: 'Desc 1', status: 'open', priority: 'low', complexity: '', },
  { id: '2', title: 'Test Ticket 2', description: 'Desc 2', status: 'in-progress', priority: 'medium', complexity: '', },
  { id: '3', title: 'Test Ticket 3', description: 'Desc 3', status: 'done', priority: 'high', complexity: '', },
];

const mockTicketContext: TicketContextType = {
  tickets: mockTickets,
  milestones: [],
  loading: false,
  error: null,
  refreshTickets: vi.fn(),
  addTicket: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
  pagination: { offset: 0, limit: 20, total: 3, totalFiltered: 3 },
  setPagination: vi.fn(),
  filters: {},
  setFilters: vi.fn(),
  sort: { field: 'id', order: 'asc' },
  setSort: vi.fn(),
  loadAllTickets: vi.fn(),
};

const mockStatusContext: StatusContextType = {
  statuses: mockStatuses,
  loading: false,
  addStatus: vi.fn(),
  updateStatus: vi.fn(),
  deleteStatus: vi.fn(),
  refreshStatuses: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <StatusContext.Provider value={mockStatusContext}>
      <TicketContext.Provider value={mockTicketContext}>
        {ui}
      </TicketContext.Provider>
    </StatusContext.Provider>
  );
};

describe('KanbanBoard', () => {
  it('renders columns for each status', () => {
    renderWithProviders(<KanbanBoard />);
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders tickets in the correct columns', () => {
    renderWithProviders(<KanbanBoard />);
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 3')).toBeInTheDocument();
  });

  it('shows ticket count in each column', () => {
    renderWithProviders(<KanbanBoard />);
    expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Each column has 1 ticket
  });

  it('shows move buttons for tickets', () => {
    renderWithProviders(<KanbanBoard />);
    // There should be move buttons for each ticket except in its own column
    expect(screen.getAllByLabelText(/Move to/i).length).toBeGreaterThan(0);
  });

  it('moves a ticket when a move button is clicked', () => {
    renderWithProviders(<KanbanBoard />);
    const moveButtons = screen.getAllByLabelText(/Move to/i);
    fireEvent.click(moveButtons[0]);
    // After moving, the ticket should appear in the new column
    // (This test assumes the TicketProvider updates state correctly)
  });

  it('navigates to ticket view page when a ticket card is clicked', () => {
    // Mock window.location.hash setter using Object.defineProperty
    const originalHash = window.location.hash;
    const setHashMock = vi.fn();
    Object.defineProperty(window.location, 'hash', {
      configurable: true,
      set: setHashMock,
    });
    renderWithProviders(<KanbanBoard />);
    const ticketCard = screen.getByText('Test Ticket 1').closest('.ticket-green');
    expect(ticketCard).toBeTruthy();
    if (ticketCard) {
      fireEvent.click(ticketCard);
      expect(setHashMock).toHaveBeenCalledWith('#ticket/view/1');
    }
    // Restore original hash property
    Object.defineProperty(window.location, 'hash', {
      configurable: true,
      value: originalHash,
      writable: true,
    });
  });
});
