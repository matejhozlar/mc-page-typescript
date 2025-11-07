/**
 * Database row type for the company_funds table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyFunds {
  /** Foreign key to companies table */
  company_id: string;
  balance: string;
}
