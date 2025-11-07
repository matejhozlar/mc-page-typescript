/**
 * Database row type for the daily_rewards table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyReward {
  /** Foreign key to users table */
  discord_id: string;
  last_claim_at: Date;
}
