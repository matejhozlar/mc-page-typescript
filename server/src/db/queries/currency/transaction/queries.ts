import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CurrencyTransaction } from "./types";

type Identifier = { id: number };

type Filters = {
  uuid: string;
  action: string;
  amount: string;
  fromUuid: string;
  toUuid: string;
  denmination: number;
  count: number;
  balanceAfter: number;
  timestamp: Date;
};

type Update = Filters;

export class CurrencyTransactionQueries extends BaseQueries<{
  Entity: CurrencyTransaction;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "currency_transactions";

  constructor(db: Pool) {
    super(db);
  }
}
