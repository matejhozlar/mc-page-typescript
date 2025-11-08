/**
 * Database row type for the rejected_shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface RejectedShop {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  /** Foreign key to users table */
  founder_uuid: string | null;
  name: string;
  reason: string;
  rejected_at: Date | null;
}
