import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyMember, CompanyMemberCreate } from "./types";

type Identifier = { userUuid: string } | { companyId: number };

type Filters = {
  role: string;
  joinedAt: Date;
};

type Update = Filters;

export class CompanyMemberQueries extends BaseQueries<{
  Entity: CompanyMember;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyMemberCreate;
}> {
  protected readonly table = "company_members";

  constructor(db: Pool) {
    super(db);
  }
}
