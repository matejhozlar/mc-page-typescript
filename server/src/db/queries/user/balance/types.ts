/**
 * Database row type for the user_funds table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface UserBalance {
  /** Foreign key to users table */
  uuid: string;
  balance: string;
  last_updated: Date | null;
  name: string;
  /** Foreign key to users table */
  discord_id: string;
}

export interface UserBalanceCreate {
  uuid: string;
  balance?: string;
  last_updated?: Date;
  name: string;
  discord_id: string;
}
