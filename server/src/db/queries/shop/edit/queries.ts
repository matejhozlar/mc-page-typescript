import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopEdit } from "./types";

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

  constructor(db: Pool) {
    super(db);
  }
}
