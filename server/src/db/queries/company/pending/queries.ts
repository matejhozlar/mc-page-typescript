import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import type { CompanyPending } from "./types";

type Identifier = { id: number };

type Filters = {
  founderUuid: string;
  name: string;
  description: string;
  shortDescription: string;
  logoUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
  createdAt: Date;
  status: string;
  reviewedAt: Date;
  reviewedBy: string;
  feeRequired: string;
  feeCheckedAt: Date;
};

type Update = Filters;

export class CompanyPendingQueries extends BaseQueries<{
  Entity: CompanyPending;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "companies_pending";

  constructor(db: Pool) {
    super(db);
  }
}
