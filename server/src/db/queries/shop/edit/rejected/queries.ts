import { BaseQueries } from "@/db/queries/base.queries";
import { ShopEditRejected, ShopEditRejectedCreate } from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  shopId: number;
  editorUuid: string;
  reason: string;
  rejectedAt: Date;
};

type Update = Filters;

export class ShopEditRejectedQueries extends BaseQueries<{
  Entity: ShopEditRejected;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopEditRejectedCreate;
}> {
  protected readonly table = "shop_edits_rejected";

  constructor(db: Pool) {
    super(db);
  }
}
