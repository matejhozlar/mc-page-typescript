/**
 * Database row type for the companies table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Company {
  id: number;
  /** Foreign key to users table */
  founder_uuid: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  footer: string | null;
  created_at: Date | null;
}
