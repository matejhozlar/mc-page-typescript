/**
 * Database row type for the company_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyTransaction {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  /** Foreign key to users table */
  user_uuid: string | null;
  type: string | null;
  amount: string | null;
  created_at: Date | null;
}
