export type TicketStatus = "open" | "closed";

export interface Ticket {
  id: number;
  ticket_number: number;
  discord_id: string;
  mc_name: string | null;
  channel_id: string;
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
  admin_message_id: string | null;
}

export interface TicketCreateParams {
  discord_id: string;
  channel_id: string;
  ticket_number: number;
  mc_name?: string;
}

export interface TicketUpdateParams {
  status?: TicketStatus;
  mc_name?: string;
  admin_message_id?: string;
}

export interface TicketCounter {
  id: number;
  last_number: number;
}
