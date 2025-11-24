import { BaseQueries } from "@/db/queries/base.queries";
import {
  CryptoTokenMetric,
  CryptoTokenMetricCreate,
  CryptoTokenMetricRow,
} from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  tokenId: number;
  snapshot: string;
  lastPrice: string;
  recordedAt: Date;
};

type Update = Filters;

export class CryptoTokenMetricQueries extends BaseQueries<{
  Entity: CryptoTokenMetric;
  DbEntity: CryptoTokenMetricRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CryptoTokenMetricCreate;
}> {
  protected readonly table = "crypto_token_metrics";

  constructor(db: Pool) {
    super(db);
  }
}
