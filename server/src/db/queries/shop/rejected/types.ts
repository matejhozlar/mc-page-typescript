import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the rejected_shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopRejectedRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  /** Foreign key to users table */
  founder_uuid: string;
  name: string;
  reason: string;
  rejected_at: Date;
}

export type ShopRejected = CamelCaseKeys<ShopRejectedRow>;

export interface ShopRejectedCreate {
  companyId: number;
  founderUuid: string;
  name: string;
  reason: string;
}
