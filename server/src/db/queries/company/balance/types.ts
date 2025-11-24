import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_funds table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyBalanceRow {
  /** Foreign key to companies table */
  company_id: number;
  balance: string;
}

export type CompanyBalance = CamelCaseKeys<CompanyBalanceRow>;

export interface CompanyBalanceCreate {
  companyId: number;
  balance: string;
}
