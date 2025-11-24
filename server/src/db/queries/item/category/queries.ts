import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ItemCategory, ItemCategoryCreate, ItemCategoryRow } from "./types";
import { ItemCategoryMapQueries } from "./map";

type Identifier = { id: number } | { name: number };

type Filters = { shopId: number };

export class ItemCategoryQueries extends BaseQueries<{
  Entity: ItemCategory;
  DbEntity: ItemCategoryRow;
  Identifier: Identifier;
  Filters: Filters;
  Create: ItemCategoryCreate;
}> {
  protected readonly table = "item_categories";

  private _map?: ItemCategoryMapQueries;

  constructor(db: Pool) {
    super(db);
  }

  get map(): ItemCategoryMapQueries {
    if (!this._map) {
      this._map = new ItemCategoryMapQueries(this.db);
    }
    return this._map;
  }
}
