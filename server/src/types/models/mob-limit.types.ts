/**
 * Database row type for the mob_limit_reached table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface MobLimit {
  /** Foreign key to users table */
  uuid: string;
  date_reached: Date;
}
