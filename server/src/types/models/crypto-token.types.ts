/**
 * Database row type for the crypto_tokens table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoToken {
  id: number;
  name: string;
  symbol: string;
  description: string | null;
  total_supply: string;
  available_supply: string;
  price_per_unit: string;
  is_memecoin: boolean | null;
  crashed: Date | null;
}
