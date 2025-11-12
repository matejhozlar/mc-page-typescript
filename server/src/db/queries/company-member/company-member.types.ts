/**
 * Database row type for the company_members table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyMember {
  /** Foreign key to users table */
  user_uuid: string;
  /** Foreign key to companies table */
  company_id: number;
  role: string;
  joined_at: Date;
}

export interface CompanyMemberCreate {
  user_uuid: string;
  company_id: number;
  role: string;
}
