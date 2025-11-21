/**
 * Database row type for the tickets table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Ticket {
  id: number;
  ticket_number: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to users table */
  mc_name: string;
  channel_id: string;
  status: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  admin_message_id: string | null;
}

export interface TicketCreate {
  ticket_number: number;
  discord_id: string;
  mc_name: string;
  channel_id: string;
}
