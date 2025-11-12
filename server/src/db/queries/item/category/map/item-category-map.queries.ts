import { BaseQueries } from "@/db/queries/base.queries";
import type {
  ItemCategoryMap,
  ItemCategoryMapCreate,
} from "./item-category-map.types";
import { Pool } from "pg";

type ItemCategoryMapIdentifier = { itemId: number; categoryId: number };

type ItemCategoryMapFilters = { itemId: number } | { categoryId: number };

type ItemCategoryMapUpdate = {};

export class ItemCategoryMapQueries extends BaseQueries<
  ItemCategoryMap,
  ItemCategoryMapIdentifier,
  ItemCategoryMapFilters,
  ItemCategoryMapUpdate,
  ItemCategoryMapCreate
> {
  protected readonly table = "item_category_map";

  constructor(db: Pool) {
    super(db);
  }
}
