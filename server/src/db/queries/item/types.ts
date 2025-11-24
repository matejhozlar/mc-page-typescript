import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the items table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ItemRow {
  id: number;
  /** Foreign key to shops table */
  shop_id: number | null;
  name: string;
  description: string | null;
  price: string;
  created_at: Date | null;
  stock: number;
  image_url: string | null;
  updated_at: Date;
  status: string;
  sku: string | null;
  is_featured: boolean;
}

export type Item = CamelCaseKeys<ItemRow>;
