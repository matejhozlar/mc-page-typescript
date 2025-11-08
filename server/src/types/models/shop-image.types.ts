/**
 * Database row type for the shop_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopImage {
  id: number;
  /** Foreign key to shops table */
  shop_id: number | null;
  url: string;
  type: string | null;
  position: number | null;
  uploaded_at: Date | null;
}
