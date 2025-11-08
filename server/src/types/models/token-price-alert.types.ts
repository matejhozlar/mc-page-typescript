/**
 * Database row type for the token_price_alerts table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TokenPriceAlert {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date | null;
  direction: string | null;
}
