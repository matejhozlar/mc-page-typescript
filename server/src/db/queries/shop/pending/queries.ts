import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopPending, ShopPendingRow } from "./types";

type Identifier = { id: number };

type Filters = {
  companyId: number;
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

export class ShopPendingQueries extends BaseQueries<{
  Entity: ShopPending;
  DbEntity: ShopPendingRow;
  Identifier: Identifier;
  Filters: Filters;
}> {
  protected readonly table = "shop_pending";

  constructor(db: Pool) {
    super(db);
  }
}
