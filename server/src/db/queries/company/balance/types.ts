/**
 * Database row type for the company_funds table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyBalance {
  /** Foreign key to companies table */
  company_id: number;
  balance: string;
}

export interface CompanyBalanceCreate {
  company_id: number;
  balance: string;
}
