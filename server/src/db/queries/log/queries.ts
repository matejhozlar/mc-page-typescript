import { Pool } from "pg";
import { LogRconQueries } from "./rcon";
import { LogAiQueries } from "./ai";

export class LogQueries {
  private _rcon?: LogRconQueries;

  private _ai?: LogAiQueries;

  constructor(protected db: Pool) {}

  get rcon(): LogRconQueries {
    if (!this._rcon) {
      this._rcon = new LogRconQueries(this.db);
    }
    return this._rcon;
  }

  get ai(): LogAiQueries {
    if (!this._ai) {
      this._ai = new LogAiQueries(this.db);
    }
    return this._ai;
  }
}
