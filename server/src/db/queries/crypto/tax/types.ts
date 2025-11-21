/**
 * Database row type for the memecoin_tax_tracker table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CryptoTax {
  id: number;
  total_collected: string;
}
