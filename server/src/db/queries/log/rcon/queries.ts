import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { LogRcon } from "./types";

type Identifier = { id: number };

type Filters = {
  discordId: string;
  mcName: string;
  command: string;
  executedAt: Date;
};

type Update = Filters;

export class LogRconQueries extends BaseQueries<{
  Entity: LogRcon;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "logs_rcon";

  constructor(db: Pool) {
    super(db);
  }
}
