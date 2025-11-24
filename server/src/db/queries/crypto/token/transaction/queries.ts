import { BaseQueries } from "@/db/queries/base.queries";
import {
  CryptoTokenTransaction,
  CryptoTokenTransactionCreate,
  CryptoTokenTransactionRow,
} from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  discordId: string;
  tokenId: number;
  amount: string;
  priceAtTransaction: string;
  type: string;
  timestamp: Date;
};

type Update = Filters;

export class CryptoTokenTransactionQueries extends BaseQueries<{
  Entity: CryptoTokenTransaction;
  DbEntity: CryptoTokenTransactionRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CryptoTokenTransactionCreate;
}> {
  protected readonly table = "crypto_token_transactions";

  constructor(db: Pool) {
    super(db);
  }
}
