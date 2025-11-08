/**
 * Database row type for the token_metrics table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface TokenMetric {
  id: number;
  /** Foreign key to crypto_tokens table */
  token_id: number | null;
  snapshot: string;
  last_price: string;
  recorded_at: Date | null;
}
