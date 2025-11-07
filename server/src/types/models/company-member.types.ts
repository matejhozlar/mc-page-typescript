/**
 * Database row type for the company_members table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyMembers {
  /** Foreign key to users table */
  user_uuid: string;
  /** Foreign key to companies table */
  company_id: number;
  role: string | null;
  joined_at: Date | null;
}
