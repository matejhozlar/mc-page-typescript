import type { Pool } from "pg";
import type {
  CompanyInterestLedger,
  CompanyInterestLedgerCreate,
} from "./company-interest-ledger.types";
import { BaseQueries } from "../base.queries";

type CompanyInterestLedgerIdentifier = { id: number };

type CompanyInterestLedgerFilters =
  | { companyId: number }
  | { interestAmount: string }
  | { ratePerHour: string }
  | { balanceBefore: string }
  | { balanceAfter: string }
  | { createdAt: Date };

type CompanyInterestLedgerUpdate = CompanyInterestLedgerFilters;

export class CompanyInterestLedgerQueries extends BaseQueries<
  CompanyInterestLedger,
  CompanyInterestLedgerIdentifier,
  CompanyInterestLedgerFilters,
  CompanyInterestLedgerUpdate,
  CompanyInterestLedgerCreate
> {
  protected readonly table = "company_interest_ledger";

  constructor(db: Pool) {
    super(db);
  }
}
