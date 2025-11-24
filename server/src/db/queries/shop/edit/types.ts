import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the shop_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopEditRow {
  id: number;
  /** Foreign key to shops table */
  shop_id: number;
  /** Foreign key to users table */
  editor_uuid: string;
  name: string | null;
  description: string | null;
  short_description: string | null;
  logo_path: string | null;
  banner_path: string | null;
  gallery_urls: any | null;
  status: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  /** Foreign key to users table */
  reviewed_by: string | null;
  fee_required: string | null;
  fee_checked_at: Date | null;
  reason: string | null;
}

export type ShopEdit = CamelCaseKeys<ShopEditRow>;
