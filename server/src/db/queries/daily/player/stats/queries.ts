import { BaseQueries } from "@/db/queries/base.queries";
import {
  DailyPlayerStat,
  DailyPlayerStatCreate,
  DailyPlayerStatRow,
} from "./types";
import { Pool } from "pg";

type Identifier =
  | { uuid: string }
  | { statType: string }
  | { statKey: string }
  | { statDate: Date };

type Filters = Identifier;

type Update = Filters;

export class DailyPlayerStatQueries extends BaseQueries<{
  Entity: DailyPlayerStat;
  DbEntity: DailyPlayerStatRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: DailyPlayerStatCreate;
}> {
  protected readonly table = "daily_player_stats";

  constructor(db: Pool) {
    super(db);
  }
}
