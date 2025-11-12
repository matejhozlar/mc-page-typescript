import type { Pool } from "pg";
import type { DailyReward, DailyRewardCreate } from "./daily-reward.types";
import { BaseQueries } from "../../base.queries";

type DailyRewardIdentifier = { discordId: string };

type DailyRewardFilters = { lastClaimAt: Date };

type DailyRewardUpdate = DailyRewardFilters;

export class DailyRewardQueries extends BaseQueries<
  DailyReward,
  DailyRewardIdentifier,
  DailyRewardFilters,
  DailyRewardUpdate,
  DailyRewardCreate
> {
  protected readonly table = "daily_rewards";

  constructor(db: Pool) {
    super(db);
  }
}
