/**
 * Database row type for the rcon_logs table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface LogRcon {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  mc_name: string;
  command: string;
  executed_at: Date;
}
