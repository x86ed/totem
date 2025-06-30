/**
 * Represents a ticket in the project management system
 * 
 * A ticket is a work item that tracks tasks, bugs, features, or other actionable items
 * that need to be completed. Each ticket has a unique identifier, descriptive information,
 * workflow status, priority level, and optional assignment details.
 * 
 * @interface Ticket
 */
export interface Ticket {
  /** Unique identifier for the ticket (e.g., "TKT-001") */
  id: string;
  /** Brief, descriptive title of the ticket */
  title: string;
  /** Detailed description of what needs to be done or the issue to be resolved */
  description: string;
  /** Current workflow status of the ticket */
  status: 'todo' | 'in-progress' | 'review' | 'done';
  /** Priority level indicating urgency and importance */
  priority: 'low' | 'medium' | 'high';
  /** Optional username or identifier of the person assigned to work on this ticket */
  assignee?: string;
  /** Optional milestone identifier that this ticket contributes to */
  milestone?: string;
  /** ISO date string when the ticket was created */
  created: string;
}

/**
 * Represents a project milestone or release target
 * 
 * A milestone is a significant point or event in a project timeline that marks
 * the completion of a major deliverable or phase. Milestones help organize work
 * into manageable chunks and provide clear targets for project completion.
 * 
 * @interface Milestone
 */
export interface Milestone {
  /** Unique identifier for the milestone (e.g., "v1.0", "beta-release") */
  id: string;
  /** Descriptive name of the milestone */
  title: string;
  /** Detailed description of what this milestone represents or includes */
  description: string;
  /** Target completion date in ISO date string format */
  dueDate: string;
  /** Current status of the milestone in the project lifecycle */
  status: 'planning' | 'active' | 'completed';
}

/**
 * Context interface for ticket management state and operations
 * 
 * This interface defines the shape of the React context that provides
 * ticket and milestone data along with functions to manipulate them.
 * It serves as the central state management contract for the application.
 * 
 * @interface TicketContextType
 */
export interface TicketContextType {
  /** Array of all tickets in the system */
  tickets: Ticket[];
  /** Array of all milestones in the system */
  milestones: Milestone[];
  /** Function to add a new ticket to the system */
  addTicket: (ticket: Ticket) => void;
  /** Function to update an existing ticket */
  updateTicket: (ticket: Ticket) => void;
  /** Function to remove a ticket from the system by its ID */
  deleteTicket: (ticketId: string) => void;
  /** Function to move a ticket to a different status column */
  moveTicket: (ticketId: string, newStatus: Ticket['status']) => void;
  /** Function to add a new milestone to the system */
  addMilestone: (milestone: Milestone) => void;
  /** Function to update an existing milestone */
  updateMilestone: (milestone: Milestone) => void;
}

/**
 * Configuration interface for navigation tabs in the application
 * 
 * Defines the structure for tab items in the main navigation bar,
 * including visual elements and identification properties needed
 * for tab switching and display.
 * 
 * @interface TabConfig
 */
export interface TabConfig {
  /** Unique identifier for the tab (used for routing and state management) */
  id: string;
  /** Display text shown on the tab button */
  label: string;
  /** Emoji or icon character displayed alongside the label */
  icon: string;
}
