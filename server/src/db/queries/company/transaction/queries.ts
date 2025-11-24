import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import {
  CompanyTransaction,
  CompanyTransactionCreate,
  CompanyTransactionRow,
} from "./types";

type Identifier = { id: number };

type Filters = {
  companyId: string;
  userUuid: string;
  type: string;
  amount: string;
  createdAt: Date;
};

type Update = Filters;

export class CompanyTransactionQueries extends BaseQueries<{
  Entity: CompanyTransaction;
  DbEntity: CompanyTransactionRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyTransactionCreate;
}> {
  protected readonly table = "company_transactions";

  constructor(db: Pool) {
    super(db);
  }
}
