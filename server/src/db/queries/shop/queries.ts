import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Shop, ShopCreate, ShopRow } from "./types";
import { ShopEditQueries } from "./edit";
import { ShopImageQueries } from "./image";
import { ShopLocationQueries } from "./location";
import { ShopReviewQueries } from "./review";
import { ShopPendingQueries } from "./pending";
import { ShopRejectedQueries } from "./rejected/queries";

type Identifier = { id: number };

type Filters = {
  companyId: number;
  name: string;
  description: string;
  isPaid: boolean;
  createdAt: Date;
  shortDescription: string;
};

type Update = Filters;

export class ShopQueries extends BaseQueries<{
  Entity: Shop;
  DbEntity: ShopRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: ShopCreate;
}> {
  protected readonly table = "shops";

  private _edit?: ShopEditQueries;

  private _image?: ShopImageQueries;

  private _location?: ShopLocationQueries;

  private _review?: ShopReviewQueries;

  private _pending?: ShopPendingQueries;

  private _rejected?: ShopRejectedQueries;

  constructor(db: Pool) {
    super(db);
  }

  get edit(): ShopEditQueries {
    if (!this._edit) {
      this._edit = new ShopEditQueries(this.db);
    }
    return this._edit;
  }

  get image(): ShopImageQueries {
    if (!this._image) {
      this._image = new ShopImageQueries(this.db);
    }
    return this._image;
  }

  get location(): ShopLocationQueries {
    if (!this._location) {
      this._location = new ShopLocationQueries(this.db);
    }
    return this._location;
  }

  get review(): ShopReviewQueries {
    if (!this._review) {
      this._review = new ShopReviewQueries(this.db);
    }
    return this._review;
  }

  get pending(): ShopPendingQueries {
    if (!this._pending) {
      this._pending = new ShopPendingQueries(this.db);
    }
    return this._pending;
  }

  get rejected(): ShopRejectedQueries {
    if (!this._rejected) {
      this._rejected = new ShopRejectedQueries(this.db);
    }
    return this._rejected;
  }
}
