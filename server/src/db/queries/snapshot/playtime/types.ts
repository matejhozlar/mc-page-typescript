import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the server_playtime_snapshots table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface SnapshotPlaytimeRow {
  id: number;
  total_seconds: string;
  snapshot_time: Date;
}

export type SnapshotPlaytime = CamelCaseKeys<SnapshotPlaytimeRow>;

export interface SnapshotPlaytimeCreate {
  totalSeconds: string;
}
