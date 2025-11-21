import { Pool } from "pg";
import { LeaderboardMessageQueries } from "./message";

export class LeaderboardQueries {
  private _message?: LeaderboardMessageQueries;

  constructor(protected db: Pool) {}

  get message(): LeaderboardMessageQueries {
    if (!this._message) {
      this._message = new LeaderboardMessageQueries(this.db);
    }
    return this._message;
  }
}
