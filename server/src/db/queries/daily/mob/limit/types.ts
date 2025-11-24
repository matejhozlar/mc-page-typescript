import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the mob_limit_reached table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyMobLimitRow {
  /** Foreign key to users table */
  uuid: string;
  date_reached: Date;
}

export type DailyMobLimit = CamelCaseKeys<DailyMobLimitRow>;

export interface DailyMobLimitCreate {
  uuid: string;
  dateReached: Date;
}
