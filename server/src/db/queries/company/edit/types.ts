/**
 * Database row type for the company_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyEdit {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  /** Foreign key to users table */
  editor_uuid: string | null;
  name: string | null;
  description: string | null;
  short_description: string | null;
  logo_path: string | null;
  banner_path: string | null;
  gallery_paths: string[] | null;
  status: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  /** Foreign key to users table */
  reviewed_by: string | null;
  fee_required: string | null;
  fee_checked_at: Date | null;
  reason: string | null;
}

export interface CompanyEditCreate {
  company_id: number;
  editor_uuid: string;
  name?: string;
  description?: string;
  short_description?: string;
  logo_path?: string;
  gallery_paths?: string[];
  status?: string;
  reviewed_by: string;
  fee_required?: string;
  reason: string;
}
