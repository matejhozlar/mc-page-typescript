import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the crypto_tokens table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTokenRow {
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

export type CryptoToken = CamelCaseKeys<CryptoTokenRow>;

export interface CryptoTokenCreate {
  name: string;
  symbol: string;
  description?: string;
  totalSupply: string;
  availableSupply: string;
  pricePerUnit: string;
  isMemecoin?: boolean;
}
