import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import type {
  DailyPlaytime,
  DailyPlaytimeCreate,
} from "./daily-playtime.types";

type DailyPlaytimeIdentifier = { uuid: string };

type DailyPlaytimeFilters = { play_date: Date } | { seconds_played: number };

type DailyPlaytimeUpdate = DailyPlaytimeFilters;

export class DailyPlaytimeQueries extends BaseQueries<
  DailyPlaytime,
  DailyPlaytimeIdentifier,
  DailyPlaytimeFilters,
  DailyPlaytimeUpdate,
  DailyPlaytimeCreate
> {
  protected readonly table = "daily_playtime";

  constructor(db: Pool) {
    super(db);
  }
}
