/**
 * Database row type for the user_funds table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface UserFunds {
  /** Foreign key to users table */
  uuid: string;
  balance: string;
  last_updated: Date | null;
  name: string | null;
  discord_id: string | null;
}
