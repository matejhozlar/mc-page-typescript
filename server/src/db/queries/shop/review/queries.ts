import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ShopReview, ShopReviewCreate } from "./types";

type Identifier = { id: string } | { shopId: number } | { userUuid: string };

type Filters = {
  rating: number;
  review: string;
  createdAt: Date;
};

type Update = Filters;

export class ShopReviewQueries extends BaseQueries<{
  Entity: ShopReview;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopReviewCreate;
}> {
  protected readonly table = "shop_reviews";

  constructor(db: Pool) {
    super(db);
  }
}
