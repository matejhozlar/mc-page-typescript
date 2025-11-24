import { CamelCaseKeys } from "@/types/common";

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
export interface CryptoTokenAlertRow {
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date;
  direction: CryptoAlertDirection;
}

export type CryptoTokenAlert = CamelCaseKeys<CryptoTokenAlertRow>;

export interface CryptoTokenAlertCreate {
  discordId: string;
  tokenSymbol: string;
  targetPrice: string;
  direction?: CryptoAlertDirection;
}
