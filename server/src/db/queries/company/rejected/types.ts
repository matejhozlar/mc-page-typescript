/**
 * Database row type for the rejected_companies table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyRejected {
  id: number;
  /** Foreign key to users table */
  founder_uuid: string;
  name: string;
  reason: string;
  rejected_at: Date;
}

export interface CompanyRejectedCreate {
  founder_uuid: string;
  name: string;
  reason: string;
}
