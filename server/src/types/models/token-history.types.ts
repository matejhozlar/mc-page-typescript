/**
 * Database row type for the token_price_history_daily, token_price_history_minutes,
 * token_price_history_hourly, token_price_history_weekly table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TokenHistory {
  id: number;
  /** Foreign key to crypto_tokens table */
  token_id: number | null;
  price: string;
  recorded_at: Date | null;
}

export interface TokenHistoryCreate {
  token_id: number;
  price: string;
}
