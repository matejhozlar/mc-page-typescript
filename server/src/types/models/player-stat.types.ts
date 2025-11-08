/**
 * Database row type for the player_stats table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface PlayerStat {
  /** Foreign key to users table */
  uuid: string;
  stat_type: string;
  stat_key: string;
  value: string;
  updated_at: Date | null;
}
