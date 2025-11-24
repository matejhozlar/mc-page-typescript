import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import {
  CompanyRejected,
  CompanyRejectedCreate,
  CompanyRejectedRow,
} from "./types";

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
  DbEntity: CompanyRejectedRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyRejectedCreate;
}> {
  protected readonly table = "company_rejected";

  constructor(db: Pool) {
    super(db);
  }
}
