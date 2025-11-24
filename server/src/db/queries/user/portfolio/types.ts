import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the user_portfolio_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface UserPortfolioRow {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  total_value: string;
  recorded_at: Date;
}

export type UserPortfolio = CamelCaseKeys<UserPortfolioRow>;

export interface UserPortfolioCreate {
  discordId: string;
  totalValue: string;
}
