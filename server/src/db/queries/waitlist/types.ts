import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the waitlist_emails table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface WaitlistRow {
  id: number;
  email: string;
  submitted_at: Date | null;
  token: string | null;
  discord_name: string | null;
}

export type Waitlist = CamelCaseKeys<WaitlistRow>;

export interface WaitlistCreate {
  email: string;
  discordName: string;
}

export interface WaitlistSubmission {
  id: number;
  email: string;
  discordName: string | null;
}

export interface InviteResult {
  ok: boolean;
  code?: number;
  msg?: string;
  token?: string;
}

export interface AutoInviteResult {
  ok: boolean;
  msg?: string;
  token?: string;
}
