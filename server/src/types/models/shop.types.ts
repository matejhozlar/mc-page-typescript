/**
 * Database row type for the shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Shop {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  name: string;
  description: string | null;
  is_paid: boolean | null;
  created_at: Date | null;
  short_description: string | null;
}
