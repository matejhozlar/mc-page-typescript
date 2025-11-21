import { BaseQueries } from "@/db/queries/base.queries";
import { DailyMobLimit, DailyMobLimitCreate } from "./types";
import { Pool } from "pg";

type Identifier = { uuid: string };

type Filters = { dateReached: Date };

type Update = Filters;

export class DailyMobLimitQueries extends BaseQueries<{
  Entity: DailyMobLimit;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: DailyMobLimitCreate;
}> {
  protected readonly table = "daily_mob_limit";

  constructor(db: Pool) {
    super(db);
  }
}
