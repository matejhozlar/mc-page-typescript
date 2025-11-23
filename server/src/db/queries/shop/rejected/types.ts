/**
 * Database row type for the rejected_shops table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopRejected {
  id: number;
  /** Foreign key to companies table */
  company_id: number;
  /** Foreign key to users table */
  founder_uuid: string;
  name: string;
  reason: string;
  rejected_at: Date;
}

export interface ShopRejectedCreate {
  company_id: number;
  founder_uuid: string;
  name: string;
  reason: string;
}
