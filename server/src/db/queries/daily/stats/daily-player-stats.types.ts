/**
 * Database row type for the daily_player_stats table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyPlayerStats {
  /** Foreign key to users table */
  uuid: string;
  stat_type: string;
  stat_key: string;
  stat_date: Date;
  value: number;
}

export interface DailyPlayerStatsCreate {
  uuid: string;
  stat_type: string;
  stat_key: string;
  stat_date: Date;
  value: number;
}
