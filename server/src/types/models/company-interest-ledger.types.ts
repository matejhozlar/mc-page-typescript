/**
 * Database row type for the company_interest_ledger table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyInterestLedger {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  interest_amount: string;
  rate_per_hour: string;
  balance_before: string;
  balance_after: string;
  created_at: Date | null;
}
