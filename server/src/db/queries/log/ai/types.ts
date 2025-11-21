/**
 * Database row type for the ai_message_log table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LogAi {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  message: string;
  created_at: Date;
}

export interface LogAiCreate {
  /** Foreign key to users table */
  discord_id: string;
  message: string;
}
