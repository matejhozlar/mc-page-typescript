/**
 * Database row type for the admins table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Admin {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  created_at: Date;
  vanished: boolean;
}

export interface AdminCreate {
  discord_id: string;
}
