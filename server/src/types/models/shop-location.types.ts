/**
 * Database row type for the shop_locations table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopLocation {
  /** Foreign key to shops table */
  shop_id: number;
  dimension: string;
  x: number;
  z: number;
  y: number;
  updated_at: Date;
  tempad: string | null;
}
