import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { SnapshotPlaytime, SnapshotPlaytimeCreate, SnapshotPlaytimeRow } from "./types";

type Identifier = { id: number };

type Filters = {
  totalSeconds: string;
  snapshotTime: Date;
};

type Update = Filters;

export class SnapshotPlaytimeQueries extends BaseQueries<{
  Entity: SnapshotPlaytime;
  DbEntity: SnapshotPlaytimeRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: SnapshotPlaytimeCreate;
}> {
  protected readonly table = "snapshots_playtime";

  constructor(db: Pool) {
    super(db);
  }
}
