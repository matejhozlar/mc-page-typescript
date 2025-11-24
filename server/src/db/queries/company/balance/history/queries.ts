import { BaseQueries } from "@/db/queries/base.queries";
import {
  CompanyBalanceHistory,
  CompanyBalanceHistoryCreate,
  CompanyBalanceHistoryRow,
} from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  companyId: number;
  balance: string;
  recordedAt: Date;
};

type Update = Filters;

export class CompanyBalanceHistoryQueries extends BaseQueries<{
  Entity: CompanyBalanceHistory;
  DbEntity: CompanyBalanceHistoryRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyBalanceHistoryCreate;
}> {
  protected readonly table = "company_balance_history";

  constructor(db: Pool) {
    super(db);
  }
}
