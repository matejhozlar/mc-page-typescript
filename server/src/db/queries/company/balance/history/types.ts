/**
 * Database row type for the company_balance_history table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyBalanceHistory {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  balance: string;
  recorded_at: Date;
}

export interface CompanyBalanceHistoryCreate {
  company_id: number;
  balance: string;
}
