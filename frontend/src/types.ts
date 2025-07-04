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
  /** Unique identifier for the ticket (e.g., "healthcare.security.auth-sso-001") */
  id: string;
  /** Brief, descriptive title of the ticket */
  title: string;
  /** Detailed description of what needs to be done or the issue to be resolved */
  description: string;
  /** Current workflow status of the ticket */
  status: 'open' | 'in-progress' | 'planning' | 'completed' | 'todo' | 'done' | 'closed' | 'blocked' | 'review' | 'in_progress';
  /** Priority level indicating urgency and importance */
  priority: 'low' | 'medium' | 'high';
  /** Complexity level of the ticket */
  complexity?: 'low' | 'medium' | 'high';
  /** Target persona for this ticket */
  persona?: string;
  /** Collaborator assigned to the ticket */
  collaborator?: string;
  /** Assignee of the ticket */
  assignee?: string;
  /** Acceptance criteria for the ticket */
  acceptance_criteria?: string;
  /** Milestone associated with the ticket */
  milestone?: string;
  /** Creation date of the ticket */
  created?: string;
  /** List of ticket IDs that this ticket blocks */
  blocks: string[];
  /** List of ticket IDs that block this ticket */
  blocked_by: string[];
}

/**
 * Represents an acceptance criterion for a ticket
 */
export interface AcceptanceCriterion {
  criteria: string;
  complete: boolean;
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
  /** Loading state for async operations */
  loading: boolean;
  /** Error message if any operations failed */
  error: string | null;
  /** Function to refresh tickets from the API */
  refreshTickets: () => Promise<void>;
  /** Function to add a new ticket */
  addTicket: (ticket: Partial<Ticket>) => Promise<void>;
  /** Function to create a new ticket */
  createTicket: (ticket: Partial<Ticket>) => Promise<void>;
  /** Function to update an existing ticket */
  updateTicket: (ticket: Ticket) => Promise<void>;
  /** Function to remove a ticket from the system by its ID */
  deleteTicket: (ticketId: string) => Promise<void>;
  /** Function to move a ticket between statuses */
  moveTicket?: (ticketId: string, newStatus: string) => Promise<void>;
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
