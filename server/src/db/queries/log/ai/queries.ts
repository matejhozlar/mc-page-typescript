import type { Pool } from "pg";
import type { LogAi, LogAiCreate } from "./types";
import { BaseQueries } from "../../base.queries";

type Identifier = { id: number };

type Filters = {
  discordId: string;
  message: string;
  createdAt: Date;
};

export class LogAiQueries extends BaseQueries<{
  Entity: LogAi;
  Identifier: Identifier;
  Filters: Filters;
  Create: LogAiCreate;
}> {
  protected readonly table = "ai_logs";

  constructor(db: Pool) {
    super(db);
  }
}
