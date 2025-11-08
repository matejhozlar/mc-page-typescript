/**
 * Database row type for the ticket_counter table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TicketCounter {
  id: number;
  last_number: number;
}
