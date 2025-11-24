import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CompanyImage, CompanyImageCreate, CompanyImageRow } from "./types";

type Identifier = { id: number };

type Filters = {
  companyId: number;
  url: string;
  type: string;
  position: number;
  uploadedAt: Date;
};

type Update = Filters;

export class CompanyImageQueries extends BaseQueries<{
  Entity: CompanyImage;
  DbEntity: CompanyImageRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyImageCreate;
}> {
  protected readonly table = "company_images";

  constructor(db: Pool) {
    super(db);
  }
}
