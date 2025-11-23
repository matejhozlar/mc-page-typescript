/**
 * Database row type for the token_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenTransaction {
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

export interface CryptoTokenTransactionCreate {
  discord_id?: string;
  token_id?: number;
  amount: string;
  price_at_transaction: string;
  type: string;
}
