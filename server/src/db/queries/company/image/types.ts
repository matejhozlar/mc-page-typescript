/**
 * Database row type for the company_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyImage {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  url: string;
  type: string;
  position: number;
  uploaded_at: Date;
}

export interface CompanyImageCreate {
  company_id: number;
  url: string;
  type: string;
  position?: number;
  uploaded_at?: Date;
}
