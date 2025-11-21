/**
 * Database row type for the token_price_alerts table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TokenAlert {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date | null;
  direction: string;
}

export interface TokenAlertCreate {
  discord_id: string;
  token_symbol: string;
  target_price: string;
  direction?: "above" | "under";
}
