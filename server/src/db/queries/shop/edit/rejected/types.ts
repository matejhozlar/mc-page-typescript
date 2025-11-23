/**
 * Database row type for the rejected_shop_edits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopEditRejected {
  id: string;
  /** Foreign key to shops table */
  shop_id: string;
  /** Foreign key to users table */
  editor_uuid: string;
  reason: string;
  rejected_at: Date;
}

export interface ShopEditRejectedCreate {
  shop_id: string;
  editor_uuid: string;
  reason: string;
}
