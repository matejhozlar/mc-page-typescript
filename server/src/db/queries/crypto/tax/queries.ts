import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CryptoTax } from "./types";

type Identifier = { id: number };

type Filters = { totalCollected: string };

type Update = Filters;

export class CryptoTaxQueries extends BaseQueries<{
  Entity: CryptoTax;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
}> {
  protected readonly table = "crypto_tax";

  constructor(db: Pool) {
    super(db);
  }
}
