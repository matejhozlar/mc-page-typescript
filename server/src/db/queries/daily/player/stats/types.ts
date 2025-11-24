import { CamelCaseKeys } from "@/types/common";

/**
 * Database row type for the daily_player_stats table
 * Represents the exact structure returned from PostgreSQL Queries
 */
export interface DailyPlayerStatRow {
  /** Foreign key to users table */
  uuid: string;
  stat_type: string;
  stat_key: string;
  stat_date: Date;
  value: number;
}

export type DailyPlayerStat = CamelCaseKeys<DailyPlayerStatRow>;

export interface DailyPlayerStatCreate {
  uuid: string;
  statType: string;
  statKey: string;
  statDate: Date;
  value: number;
}
