import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { DailyQuest, DailyQuestCreate } from "./types";

type Identifier =
  | { id: number }
  | { questDate: Date }
  | { quest_type: string }
  | { quest_key: string };

type Filters = {
  targetCount: number;
  progressCount: number;
  description: string;
  discordMessageId: string;
};

type Update = Filters;

export class DailyQuestQueries extends BaseQueries<{
  Entity: DailyQuest;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: DailyQuestCreate;
}> {
  protected readonly table = "daily_quests";

  constructor(db: Pool) {
    super(db);
  }
}
