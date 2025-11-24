import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the pending_shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopPendingRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number | null;
  /** Foreign key to users table */
  founder_uuid: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  gallery_urls: any | null;
  created_at: Date;
  status: string | null;
  reviewed_at: Date | null;
  /** Foreign key to users table */
  reviewed_by: string | null;
  fee_required: string | null;
  fee_checked_at: Date | null;
}

export type ShopPending = CamelCaseKeys<ShopPendingRow>;
