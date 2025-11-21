/**
 * Database row type for the daily_playtime table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyPlayerPlaytime {
  /** Foreign key to users table */
  uuid: string;
  play_date: Date;
  seconds_played: number;
}

export interface DailyPlayerPlaytimeCreate {
  uuid: string;
  play_date: Date;
  seconds_played?: number;
}
