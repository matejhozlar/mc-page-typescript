/**
 * Database row type for the chat_tokens table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ChatToken {
  token: string;
  /** Foreign key to users table */
  discord_id: string;
  discord_name: string | null;
  expires_at: Date;
}
