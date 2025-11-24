import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_members table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyMemberRow {
  /** Foreign key to users table */
  user_uuid: string;
  /** Foreign key to companies table */
  company_id: number;
  role: string;
  joined_at: Date;
}

export type CompanyMember = CamelCaseKeys<CompanyMemberRow>;

export interface CompanyMemberCreate {
  userUuid: string;
  companyId: number;
  role: string;
}
