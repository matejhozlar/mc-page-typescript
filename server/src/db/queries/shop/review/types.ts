/**
 * Database row type for the shop_reviews table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ShopReview {
  id: string;
  /** Foreign key to shops table */
  shop_id: number;
  /** Foreign key to users table */
  user_uuid: string;
  rating: number;
  review: string | null;
  created_at: Date;
}

export interface ShopReviewCreate {
  shop_id: number;
  user_uuid: string;
  rating: number;
  review?: string;
}
