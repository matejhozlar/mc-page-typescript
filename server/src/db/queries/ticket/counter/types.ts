import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the ticket_counter table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TicketCounterRow {
  id: number;
  last_number: number;
}

export type TicketCounter = CamelCaseKeys<TicketCounterRow>;

export interface TicketCounterCreate {
  id?: number;
  lastNumber: number;
}
