/**
 * Database row type for the token_metrics table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenMetric {
  id: number;
  /** Foreign key to crypto_tokens table */
  token_id: number;
  snapshot: string;
  last_price: string;
  recorded_at: Date;
}

export interface CryptoTokenMetricCreate {
  token_id: number;
  snapshot: string;
  last_price: string;
}
