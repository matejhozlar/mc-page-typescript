import type { Pool } from "pg";
import type { CompanyFunds, CompanyFundsCreate } from "./company-funds.types";
import { BaseQueries } from "../base.queries";

type CompanyFundsIdentifier = { companyId: number };

type CompanyFundsFilters = { balance: string };

type CompanyFundsUpdate = CompanyFundsFilters;

export class CompanyFundsQueries extends BaseQueries<
  CompanyFunds,
  CompanyFundsIdentifier,
  CompanyFundsFilters,
  CompanyFundsUpdate,
  CompanyFundsCreate
> {
  protected readonly table = "company_funds";

  constructor(db: Pool) {
    super(db);
  }
}
