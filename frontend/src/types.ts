export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  milestone?: string;
  created: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'planning' | 'active' | 'completed';
}

export interface TicketContextType {
  tickets: Ticket[];
  milestones: Milestone[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticket: Ticket) => void;
  deleteTicket: (ticketId: string) => void;
  moveTicket: (ticketId: string, newStatus: Ticket['status']) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (milestone: Milestone) => void;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
}
