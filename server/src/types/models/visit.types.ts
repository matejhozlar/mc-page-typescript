/**
 * Database row type for the visits table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface Visit {
  id: number;
  date: Date;
  count: number;
}
