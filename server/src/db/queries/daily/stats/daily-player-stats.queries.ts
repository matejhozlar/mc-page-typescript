import type { Pool } from "pg";
import type {
  DailyPlayerStats,
  DailyPlayerStatsCreate,
} from "./daily-player-stats.types";
import { BaseQueries } from "../../base.queries";

type DailyPlayerStatsIdentifier =
  | { uuid: string }
  | { statType: string }
  | { statKey: string }
  | { statDate: Date };

type DailyPlayerStatsFilters =
  | { uuid: string }
  | { statType: string }
  | { statKey: string }
  | { statDate: string }
  | { value: string };

type DailyPlayerStatsUpdate = DailyPlayerStatsFilters;

export class DailyPlayerStatsQueries extends BaseQueries<
  DailyPlayerStats,
  DailyPlayerStatsIdentifier,
  DailyPlayerStatsFilters,
  DailyPlayerStatsUpdate,
  DailyPlayerStatsCreate
> {
  protected readonly table = "daily_player_stats";

  constructor(db: Pool) {
    super(db);
  }
}
