import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopEdit } from "./types";
import { ShopEditRejectedQueries } from "./rejected";

type Identifier = { id: string };

type Filters = {
  shopId: number;
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

export class ShopEditQueries extends BaseQueries<{
  Entity: ShopEdit;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "shop_edits";

  private _rejected?: ShopEditRejectedQueries;

  constructor(db: Pool) {
    super(db);
  }

  get rejected(): ShopEditRejectedQueries {
    if (!this._rejected) {
      this._rejected = new ShopEditRejectedQueries(this.db);
    }
    return this._rejected;
  }
}
