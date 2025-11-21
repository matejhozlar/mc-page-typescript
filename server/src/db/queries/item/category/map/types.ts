/**
 * Database row type for the item_category_map table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ItemCategoryMap {
  /** Foreign key to items table */
  item_id: number;
  /** Foreign key to item_categories table */
  category_id: number;
}

export interface ItemCategoryMapCreate {
  item_id: number;
  category_id: number;
}
