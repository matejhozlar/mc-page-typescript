import { Pool } from "pg";
import { ChatTokenQueries } from "./token";

export class ChatQueries {
  private _token?: ChatTokenQueries;

  constructor(protected db: Pool) {}

  get token(): ChatTokenQueries {
    if (!this._token) {
      this._token = new ChatTokenQueries(this.db);
    }
    return this._token;
  }
}
