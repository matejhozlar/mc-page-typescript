import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the chat_tokens table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ChatTokenRow {
  token: string;
  /** Foreign key to users table */
  discord_id: string;
  discord_name: string;
  expires_at: Date;
}

export type ChatToken = CamelCaseKeys<ChatTokenRow>;

export interface ChatTokenCreate {
  token: string;
  discordId: string;
  discordName: string;
}
