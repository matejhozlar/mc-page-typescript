import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import {
  LotteryParticipant,
  LotteryParticipantCreate,
  LotteryParticipantRow,
} from "./types";

type Identifier = { id: number };

type Filters = {
  uuid: string;
  name: string;
  amount: string;
  joinedAt: Date;
};

type Update = Filters;

export class LotteryParticipantQueries extends BaseQueries<{
  Entity: LotteryParticipant;
  DbEntity: LotteryParticipantRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: LotteryParticipantCreate;
}> {
  protected readonly table = "lottery_participants";

  constructor(db: Pool) {
    super(db);
  }
}
