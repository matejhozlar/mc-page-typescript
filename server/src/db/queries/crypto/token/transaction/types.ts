import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the token_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenTransactionRow {
  id: number;
  /** Foreign key to users table */
  discord_id: string | null;
  /** Foreign key to crypto_tokens table */
  token_id: number | null;
  amount: string;
  price_at_transaction: string;
  type: string;
  timestamp: Date;
}

export type CryptoTokenTransaction = CamelCaseKeys<CryptoTokenTransactionRow>;

export interface CryptoTokenTransactionCreate {
  discordId?: string;
  tokenId?: number;
  amount: string;
  priceAtTransaction: string;
  type: string;
}
