import type { Pool } from "pg";
import type { TokenAlert, TokenAlertCreate } from "./token-alert.types";
import { BaseQueries } from "../base.queries";

type TokenAlertIdentifier = { id: number };

type TokenAlertFilters =
  | { discordId: string }
  | { tokenSymbol: string }
  | { targetPrice: string }
  | { createdAt: Date }
  | { direction: "above" | "under" };

type TokenAlertUpdate =
  | { discordId: string }
  | { tokenSymbol: string }
  | { targetPrice: string }
  | { createdAt: Date }
  | { direction: "above" | "under" };

export class TokenAlertQueries extends BaseQueries<
  TokenAlert,
  TokenAlertIdentifier,
  TokenAlertFilters,
  TokenAlertUpdate,
  TokenAlertCreate
> {
  protected readonly table = "token_alert_queries";

  constructor(db: Pool) {
    super(db);
  }
}
