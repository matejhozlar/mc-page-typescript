/**
 * Database row type for the users table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface User {
  uuid: string;
  name: string;
  online: boolean;
  last_seen: Date | null;
  discord_id: string;
  play_time_seconds: string | null;
  session_start: Date | null;
  first_joined: Date;
}
