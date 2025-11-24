import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyEdit, CompanyEditCreate, CompanyEditRow } from "./types";
import { CompanyEditRejectedQueries } from "./rejected";

type Identifier = { id: number };

type Filters = {
  companyId: number;
  editorUuid: string;
  name: string;
  description: string;
  shortDescription: string;
  logoPath: string;
  bannerPath: string;
  galleryPaths: string[];
  status: string;
  createdAt: Date;
  reviewedAt: Date;
  reviewedBy: string;
  feeRequired: string;
  feeCheckedAt: Date;
  reason: string;
};

type Update = Filters;

export class CompanyEditQueries extends BaseQueries<{
  Entity: CompanyEdit;
  DbEntity: CompanyEditRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyEditCreate;
}> {
  protected readonly table = "company_edits";

  private _rejected?: CompanyEditRejectedQueries;

  constructor(db: Pool) {
    super(db);
  }

  get rejected(): CompanyEditRejectedQueries {
    if (!this._rejected) {
      this._rejected = new CompanyEditRejectedQueries(this.db);
    }
    return this._rejected;
  }
}
