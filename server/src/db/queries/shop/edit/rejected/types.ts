import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the rejected_shop_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopEditRejectedRow {
  id: string;
  /** Foreign key to shops table */
  shop_id: string;
  /** Foreign key to users table */
  editor_uuid: string;
  reason: string;
  rejected_at: Date;
}

export type ShopEditRejected = CamelCaseKeys<ShopEditRejectedRow>;

export interface ShopEditRejectedCreate {
  shopId: string;
  editorUuid: string;
  reason: string;
}
