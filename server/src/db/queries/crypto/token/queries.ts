import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { CryptoToken, CryptoTokenCreate } from "./types";

type Identifier = { id: number } | { symbol: string };

type Filters = {
  name: string;
  description: string;
  totalSupply: string;
  availableSupply: string;
  pricePerUnit: string;
  isMemecoin: boolean;
  crashed: Date;
};

type Update = Filters;

export class CryptoTokenQueries extends BaseQueries<{
  Entity: CryptoToken;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CryptoTokenCreate;
}> {
  protected readonly table = "crypto_tokens";

  constructor(db: Pool) {
    super(db);
  }
}
