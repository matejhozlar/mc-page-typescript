/**
 * Database row type for the company_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyTransaction {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  /** Foreign key to users table */
  user_uuid: string;
  type: string;
  amount: string;
  created_at: Date;
}

export interface CompanyTransactionCreate {
  company_id: number;
  user_uuid: string;
  type: string;
  amount: string;
}
