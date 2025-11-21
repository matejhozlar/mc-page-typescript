import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyInterest, CompanyInterestCreate } from "./types";

type Identifier = { id: string };

type Filters = {
  companyId: number;
  interestAmount: string;
  ratePerHour: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: Date;
};

type Update = Filters;

export class CompanyInterestQueries extends BaseQueries<{
  Entity: CompanyInterest;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyInterestCreate;
}> {
  protected readonly table = "company_interest";

  constructor(db: Pool) {
    super(db);
  }
}
