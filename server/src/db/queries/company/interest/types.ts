import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_interest_ledger table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyInterestRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  interest_amount: string;
  rate_per_hour: string;
  balance_before: string;
  balance_after: string;
  created_at: Date;
}

export type CompanyInterest = CamelCaseKeys<CompanyInterestRow>;

export interface CompanyInterestCreate {
  companyId: number;
  interestAmount: string;
  ratePerHour: string;
  balanceBefore: string;
  balanceAfter: string;
}
