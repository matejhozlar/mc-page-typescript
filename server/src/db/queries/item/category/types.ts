import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the item_categories table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ItemCategoryRow {
  id: number;
  name: string;
  /** Foreign key to shops table */
  shop_id: number | null;
}

export type ItemCategory = CamelCaseKeys<ItemCategoryRow>;

export interface ItemCategoryCreate {
  name: string;
  shopId: number;
}
