/**
 * Database row type for the rejected_company_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface RejectedCompanyEdit {
  id: string;
  company_id: number;
  editor_uuid: string;
  reason: string;
  rejected_at: Date | null;
}
