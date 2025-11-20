import { BaseQueries } from "../base.queries";
import type {
  CompanyMember,
  CompanyMemberCreate,
} from "./company-member.types";
import type { Pool } from "pg";

type CompanyMemberIdentifier = { userUuid: string; companyId: number };

type CompanyMemberFilters =
  | { userUuid: string }
  | { companyId: number }
  | { role: string }
  | { joinedAt: Date };

type CompanyMemberUpdate = { role: string } | { joinedAt: Date };

export class CompanyMemberQueries extends BaseQueries<
  CompanyMember,
  CompanyMemberIdentifier,
  CompanyMemberFilters,
  CompanyMemberUpdate,
  CompanyMemberUpdate
> {
  protected readonly table = "company_members";

  constructor(db: Pool) {
    super(db);
  }
}
