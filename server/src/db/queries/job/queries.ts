import { Pool } from "pg";
import { JobHistoryQueries } from "./history";

export class JobQueries {
  private _history?: JobHistoryQueries;

  constructor(protected db: Pool) {}

  get history(): JobHistoryQueries {
    if (!this._history) {
      this._history = new JobHistoryQueries(this.db);
    }
    return this._history;
  }
}
