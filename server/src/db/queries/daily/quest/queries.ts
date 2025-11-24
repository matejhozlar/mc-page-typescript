import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { DailyQuest, DailyQuestCreate, DailyQuestRow } from "./types";

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
  DbEntity: DailyQuestRow;
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
