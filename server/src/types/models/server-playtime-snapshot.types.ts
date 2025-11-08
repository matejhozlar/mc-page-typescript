/**
 * Database row type for the server_playtime_snapshots table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface ServerPlaytimeSnapshot {
  id: number;
  total_seconds: string;
  snapshot_time: Date | null;
}
