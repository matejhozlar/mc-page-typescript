import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the shop_images table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopImageRow {
  id: number;
  /** Foreign key to shops table */
  shop_id: number;
  url: string;
  type: string;
  position: number;
  uploaded_at: Date;
}

export type ShopImage = CamelCaseKeys<ShopImageRow>;

export interface ShopImageCreate {
  shopId: number;
  url: string;
  type: string;
  position?: number;
}
