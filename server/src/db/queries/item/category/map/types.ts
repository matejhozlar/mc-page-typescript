import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the item_category_map table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ItemCategoryMapRow {
  /** Foreign key to items table */
  item_id: number;
  /** Foreign key to item_categories table */
  category_id: number;
}

export type ItemCategoryMap = CamelCaseKeys<ItemCategoryMapRow>;

export interface ItemCategoryMapCreate {
  itemId: number;
  categoryId: number;
}
