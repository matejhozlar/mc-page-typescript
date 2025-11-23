import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopRejected, ShopRejectedCreate } from "./types";

type Identifier = { id: number };

type Filters = {
  companyId: number;
  founderUuid: string;
  name: string;
  reason: string;
  rejectedAt: Date;
};

type Update = Filters;

export class ShopRejectedQueries extends BaseQueries<{
  Entity: ShopRejected;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopRejectedCreate;
}> {
  protected readonly table = "shop_rejected";

  constructor(db: Pool) {
    super(db);
  }
}
