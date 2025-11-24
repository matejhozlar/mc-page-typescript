import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the companies table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyRow {
  id: number;
  /** Foreign key to users table */
  founder_uuid: string;
  name: string;
  description: string | null;
  short_description: string | null;
  footer: string | null;
  created_at: Date;
}

export type Company = CamelCaseKeys<CompanyRow>;

export interface CompanyCreate {
  founderUuid: string;
  name: string;
  description?: string;
  shortDescription?: string;
  footer?: string;
}
