import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the ai_message_log table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LogAiRow {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  message: string;
  created_at: Date;
}

export type LogAi = CamelCaseKeys<LogAiRow>;

export interface LogAiCreate {
  /** Foreign key to users table */
  discordId: string;
  message: string;
}
