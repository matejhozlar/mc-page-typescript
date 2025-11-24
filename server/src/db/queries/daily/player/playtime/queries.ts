import { BaseQueries } from "@/db/queries/base.queries";
import {
  DailyPlayerPlaytime,
  DailyPlayerPlaytimeCreate,
  DailyPlayerPlaytimeRow,
} from "./types";
import { Pool } from "pg";

type Identifier = { uuid: string } | { playDate: Date };

type Filters = { secondsPlayed: number };

type Update = {
  secondsPlayed: number;
  playDate: Date;
};

export class DailyPlayerPlaytimeQueries extends BaseQueries<{
  Entity: DailyPlayerPlaytime;
  DbEntity: DailyPlayerPlaytimeRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: DailyPlayerPlaytimeCreate;
}> {
  protected readonly table = "daily_player_playtime";

  constructor(db: Pool) {
    super(db);
  }
}
