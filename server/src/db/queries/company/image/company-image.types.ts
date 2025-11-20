/**
 * Database row type for the company_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyImage {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  url: string;
  type: string | null;
  position: number | null;
  uploaded_at: Date | null;
}
