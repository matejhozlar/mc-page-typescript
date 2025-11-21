/**
 * Database row type for the shop_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopImage {
  id: number;
  /** Foreign key to shops table */
  shop_id: number;
  url: string;
  type: string;
  position: number;
  uploaded_at: Date;
}

export interface ShopImageCreate {
  shop_id: number;
  url: string;
  type: string;
  position?: number;
}
