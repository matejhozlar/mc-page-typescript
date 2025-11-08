/**
 * Database row type for the rejected_companies table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface RejectedCompany {
  id: number;
  /** Foreign key to users table */
  founder_uuid: string | null;
  name: string;
  reason: string;
  rejected_at: Date | null;
}
