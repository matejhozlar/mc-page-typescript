import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the currency_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CurrencyTransactionRow {
  id: number;
  /** Foreign key to users table */
  uuid: string;
  action: string;
  amount: number;
  /** Foreign key to users table */
  from_uuid: string | null;
  /** Foreign key to users table */
  to_uuid: string | null;
  denomination: number | null;
  count: number | null;
  balance_after: number | null;
  timestamp: Date | null;
}

export type CurrencyTransaction = CamelCaseKeys<CurrencyTransactionRow>;
