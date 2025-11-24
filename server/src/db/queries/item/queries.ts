import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Item, ItemRow } from "./types";
import { ItemCategoryQueries } from "./category";

type Identifier = { id: number };

type Filters = {
  shopId: number;
  name: string;
  description: string;
  price: string;
  createdAt: Date;
  stock: number;
  imageUrl: string;
  updatedAt: Date;
  status: string;
  sku: string;
  isFeatured: boolean;
};

export class ItemQueries extends BaseQueries<{
  Entity: Item;
  DbEntity: ItemRow;
  Identifier: Identifier;
  Filters: Filters;
}> {
  protected readonly table = "items";

  private _category?: ItemCategoryQueries;

  constructor(db: Pool) {
    super(db);
  }

  get category(): ItemCategoryQueries {
    if (!this._category) {
      this._category = new ItemCategoryQueries(this.db);
    }
    return this._category;
  }
}
