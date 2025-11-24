import { BaseQueries } from "@/db/queries/base.queries";
import {
  CryptoAlertDirection,
  CryptoTokenAlert,
  CryptoTokenAlertCreate,
  CryptoTokenAlertRow,
} from "./types";
import { Pool } from "pg";

type Identifier = { id: number };

type Filters = {
  discordId: string;
  tokenSymbol: string;
  targetPrice: string;
  createdAt: Date;
  direction: CryptoAlertDirection;
};

type Update = {
  discordId: string;
  tokenSymbol: string;
  targetPrice: string;
  direction: CryptoAlertDirection;
};

export class CryptoTokenAlertQueries extends BaseQueries<{
  Entity: CryptoTokenAlert;
  DbEntity: CryptoTokenAlertRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CryptoTokenAlertCreate;
}> {
  protected readonly table = "crypto_token_alerts";

  constructor(db: Pool) {
    super(db);
  }
}
