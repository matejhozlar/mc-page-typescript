import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the tickets table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TicketRow {
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

export type Ticket = CamelCaseKeys<TicketRow>;

export interface TicketCreate {
  ticketNumber: number;
  discordId: string;
  mcName: string;
  channelId: string;
}
