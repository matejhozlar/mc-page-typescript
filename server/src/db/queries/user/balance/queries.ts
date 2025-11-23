import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { UserBalance, UserBalanceCreate } from "./types";

type Identifier = { discordId: string } | { uuid: string } | { name: string };

type Filters = {
  balance: string;
  lastUpdated: Date;
};

type Update = Filters;

export class UserBalanceQueries extends BaseQueries<{
  Entity: UserBalance;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: UserBalanceCreate;
}> {
  protected readonly table = "user_balances";

  constructor(db: Pool) {
    super(db);
  }
}
