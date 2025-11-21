import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyRejected, CompanyRejectedCreate } from "./types";

type Identifier = { id: number };

type Filters = {
  founderUuid: string;
  name: string;
  reason: string;
  rejectedAt: Date;
};

type Update = Filters;

export class CompanyRejectedQueries extends BaseQueries<{
  Entity: CompanyRejected;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyRejectedCreate;
}> {
  protected readonly table = "companies_rejected";

  constructor(db: Pool) {
    super(db);
  }
}
