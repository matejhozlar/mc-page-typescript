/**
 * Database row type for the user_portfolio_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface UserPortfolio {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  total_value: string;
  recorded_at: Date;
}

export interface UserPortfolioCreate {
  discord_id: string;
  total_value: string;
}
