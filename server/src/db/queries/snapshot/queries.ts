import { Pool } from "pg";
import { SnapshotPlaytimeQueries } from "./playtime";

export class SnapshotQueries {
  private _playtime?: SnapshotPlaytimeQueries;

  constructor(protected db: Pool) {}

  get playtime(): SnapshotPlaytimeQueries {
    if (!this._playtime) {
      this._playtime = new SnapshotPlaytimeQueries(this.db);
    }
    return this._playtime;
  }
}
