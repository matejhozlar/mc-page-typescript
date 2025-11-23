export const CryptoTokenHistoryTable = {
  MINUTELY: "crypto_token_history_minutely",
  HOURLY: "crypto_token_history_hourly",
  DAILY: "crypto_token_history_daily",
  WEEKLY: "crypto_token_history_weekly",
} as const;

export type CryptoTokenHistoryTable =
  (typeof CryptoTokenHistoryTable)[keyof typeof CryptoTokenHistoryTable];

/**
 * Database row type for the token_price_history_daily, token_price_history_minutes,
 * token_price_history_hourly, token_price_history_weekly table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenHistory {
  id: number;
  /** Foreign key to crypto_tokens table */
  token_id: number;
  price: string;
  recorded_at: Date;
}

export interface CryptoTokenHistoryCreate {
  token_id: number;
  price: string;
}
