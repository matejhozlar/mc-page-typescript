export const CryptoAlertDirection = {
  ABOVE: "above",
  UNDER: "under",
} as const;

export type CryptoAlertDirection =
  (typeof CryptoAlertDirection)[keyof typeof CryptoAlertDirection];

/**
 * Database row type for the token_price_alerts table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenAlert {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date;
  direction: CryptoAlertDirection;
}

export interface CryptoTokenAlertCreate {
  discord_id: string;
  token_symbol: string;
  target_price: string;
  direction?: CryptoAlertDirection;
}
