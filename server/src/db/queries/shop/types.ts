import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopRow {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  name: string;
  description: string | null;
  is_paid: boolean;
  created_at: Date;
  short_description: string | null;
}

export type Shop = CamelCaseKeys<ShopRow>;

export interface ShopCreate {
  companyId: number;
  name: string;
  description?: string;
  isPaid?: boolean;
  shortDescription?: string;
}
