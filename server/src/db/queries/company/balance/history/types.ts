import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_balance_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyBalanceHistoryRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  balance: string;
  recorded_at: Date;
}

export type CompanyBalanceHistory = CamelCaseKeys<CompanyBalanceHistoryRow>;

export interface CompanyBalanceHistoryCreate {
  companyId: number;
  balance: string;
}
