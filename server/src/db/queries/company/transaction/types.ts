import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the company_transactions table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface CompanyTransactionRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  /** Foreign key to users table */
  user_uuid: string;
  type: string;
  amount: string;
  created_at: Date;
}

export type CompanyTransaction = CamelCaseKeys<CompanyTransactionRow>;

export interface CompanyTransactionCreate {
  companyId: number;
  userUuid: string;
  type: string;
  amount: string;
}
