import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopLocation, ShopLocationCreate } from "./types";

type Identifier = { shopId: number };

type Filters = {
  dimension: string;
  x: number;
  z: number;
  y: number;
  updatedAt: Date;
  tempad: string;
};

type Update = Filters;

export class ShopLocationQueries extends BaseQueries<{
  Entity: ShopLocation;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopLocationCreate;
}> {
  protected readonly table = "shop_locations";

  constructor(db: Pool) {
    super(db);
  }
}
