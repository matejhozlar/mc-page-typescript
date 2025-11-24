import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the memecoin_tax_tracker table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTaxRow {
  id: number;
  total_collected: string;
}

export type CryptoTax = CamelCaseKeys<CryptoTaxRow>;
