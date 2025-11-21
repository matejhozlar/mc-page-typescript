import { Pool } from "pg";
import { LotteryParticipantQueries } from "./participant";

export class LotteryQueries {
  private _participant?: LotteryParticipantQueries;

  constructor(protected db: Pool) {}

  get participant(): LotteryParticipantQueries {
    if (!this._participant) {
      this._participant = new LotteryParticipantQueries(this.db);
    }
    return this._participant;
  }
}
