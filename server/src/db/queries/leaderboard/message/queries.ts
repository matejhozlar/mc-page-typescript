import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { LeaderboardMessage, LeaderboardMessageCreate } from "./types";

type Identifier = { id: number } | { type: string };

type Filters = {
  channelId: string;
  messageId: string;
};

type Update = Filters;

export class LeaderboardMessageQueries extends BaseQueries<{
  Entity: LeaderboardMessage;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: LeaderboardMessageCreate;
}> {
  protected readonly table = "leaderboard_messages";

  constructor(db: Pool) {
    super(db);
  }
}
