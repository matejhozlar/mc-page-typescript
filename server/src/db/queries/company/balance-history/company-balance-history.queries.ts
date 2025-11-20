import type { Pool } from "pg";
import type {
  CompanyBalanceHistory,
  CompanyBalanceHistoryCreate,
} from "./company-balance-history.types";
import { BaseQueries } from "../base.queries";

type CompanyBalanceHistoryIdentifier = { id: number };

type CompanyBalanceHistoryFilters =
  | { companyId: number }
  | { balance: string }
  | { recordedAt: Date };

type CompanyBalanceHistoryUpdate = CompanyBalanceHistoryFilters;

export class CompanyBalanceHistoryQueries extends BaseQueries<
  CompanyBalanceHistory,
  CompanyBalanceHistoryIdentifier,
  CompanyBalanceHistoryFilters,
  CompanyBalanceHistoryUpdate,
  CompanyBalanceHistoryCreate
> {
  protected readonly table = "company_balance_history";

  constructor(db: Pool) {
    super(db);
  }
}
