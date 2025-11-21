import { BaseQueries } from "@/db/queries/base.queries";
import { CompanyEditRejected } from "./types";
import { Pool } from "pg";

type Identifier = { id: string };

type Filters = {
  companyId: number;
  editorUuid: string;
  reason: string;
  rejectedAt: Date;
};

type Update = Filters;

export class CompanyEditRejectedQueries extends BaseQueries<{
  Entity: CompanyEditRejected;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "company_edits_rejected";

  constructor(db: Pool) {
    super(db);
  }
}
