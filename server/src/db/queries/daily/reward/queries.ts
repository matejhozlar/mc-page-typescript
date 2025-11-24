import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { DailyReward, DailyRewardCreate, DailyRewardRow } from "./types";

type Identifier = { discordId: string };

type Filters = { lastClaimAt: Date };

type Update = Filters;

export class DailyRewardQueries extends BaseQueries<{
  Entity: DailyReward;
  DbEntity: DailyRewardRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: DailyRewardCreate;
}> {
  protected readonly table = "daily_rewards";

  constructor(db: Pool) {
    super(db);
  }
}
