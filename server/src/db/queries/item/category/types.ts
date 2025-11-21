/**
 * Database row type for the item_categories table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ItemCategory {
  id: number;
  name: string;
  /** Foreign key to shops table */
  shop_id: number | null;
}

export interface ItemCategoryCreate {
  name: string;
  shop_id: number;
}
