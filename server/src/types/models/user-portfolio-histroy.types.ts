/**
 * Database row type for the user_portfolio_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface UserPortfolioHistory {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  total_value: string;
  recorded_at: Date | null;
}
