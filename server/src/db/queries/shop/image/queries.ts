import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopImage, ShopImageCreate } from "./types";

type Identifier = { id: number };

type Filters = {
  shopId: number;
  url: string;
  type: string;
  position: number;
  uploadedAt: Date;
};

type Update = Filters;

export class ShopImageQueries extends BaseQueries<{
  Entity: ShopImage;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopImageCreate;
}> {
  protected readonly table = "shop_images";

  constructor(db: Pool) {
    super(db);
  }
}
