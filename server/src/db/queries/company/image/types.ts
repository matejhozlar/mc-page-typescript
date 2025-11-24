import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyImageRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  url: string;
  type: string;
  position: number;
  uploaded_at: Date;
}

export type CompanyImage = CamelCaseKeys<CompanyImageRow>;

export interface CompanyImageCreate {
  companyId: number;
  url: string;
  type: string;
  position?: number;
  uploadedAt?: Date;
}
