import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the rejected_companies table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyRejectedRow {
  id: number;
  /** Foreign key to users table */
  founder_uuid: string;
  name: string;
  reason: string;
  rejected_at: Date;
}

export type CompanyRejected = CamelCaseKeys<CompanyRejectedRow>;

export interface CompanyRejectedCreate {
  founderUuid: string;
  name: string;
  reason: string;
}
