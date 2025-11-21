/**
 * Database row type for the shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Shop {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  name: string;
  description: string | null;
  is_paid: boolean;
  created_at: Date;
  short_description: string | null;
}

export interface ShopCreate {
  company_id: number;
  name: string;
  description?: string;
  is_paid?: boolean;
  short_description?: string;
}
