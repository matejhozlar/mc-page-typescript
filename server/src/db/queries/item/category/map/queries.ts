import { BaseQueries } from "@/db/queries/base.queries";
import { ItemCategoryMap, ItemCategoryMapCreate } from "./types";
import { Pool } from "pg";

type Identifier = {
  itemId: string;
  categoryId: string;
};

export class ItemCategoryMapQueries extends BaseQueries<{
  Entity: ItemCategoryMap;
  Identifier: Identifier;
  Create: ItemCategoryMapCreate;
}> {
  protected readonly table = "item_category_map";

  constructor(db: Pool) {
    super(db);
  }
}
