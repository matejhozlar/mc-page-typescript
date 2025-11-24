import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the rejected_company_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyEditRejectedRow {
  id: string;
  company_id: number;
  editor_uuid: string;
  reason: string;
  rejected_at: Date;
}

export type CompanyEditRejected = CamelCaseKeys<CompanyEditRejectedRow>;
