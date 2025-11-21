import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyBalance, CompanyBalanceCreate } from "./types";
import { CompanyBalanceHistoryQueries } from "./history";

type Identifier = { companyId: number };

type Filters = { balance: string };

type Update = Filters;

export class CompanyBalanceQueries extends BaseQueries<{
  Entity: CompanyBalance;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyBalanceCreate;
}> {
  protected readonly table = "company_balances";

  private _history?: CompanyBalanceHistoryQueries;

  constructor(db: Pool) {
    super(db);
  }

  get history(): CompanyBalanceHistoryQueries {
    if (!this._history) {
      this._history = new CompanyBalanceHistoryQueries(this.db);
    }
    return this._history;
  }
}
