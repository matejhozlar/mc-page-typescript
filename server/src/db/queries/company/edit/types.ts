import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyEditRow {
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

export type CompanyEdit = CamelCaseKeys<CompanyEditRow>;

export interface CompanyEditCreate {
  companyId: number;
  editorUuid: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  logoPath?: string;
  galleryPaths?: string[];
  status?: string;
  reviewedBy: string;
  feeRequired?: string;
  reason: string;
}
