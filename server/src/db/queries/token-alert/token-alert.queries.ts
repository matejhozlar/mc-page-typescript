import type { Pool } from "pg";
import type { TokenAlert, TokenAlertCreateParams } from "./token-alert.types";
import { BaseQueries } from "../base.queries";

export const Direction = {
  ABOVE: "above",
  UNDER: "under",
} as const;

export type TokenAlertDirection = (typeof Direction)[keyof typeof Direction];

type TokenAlertCriteria =
  | { id: number }
  | { discordId: string }
  | { tokenSymbol: string };

type TokenAlertUpdate =
  | { discordId: string }
  | { tokenSymbol: string }
  | { targetPrice: string }
  | { direction: TokenAlertDirection };

export class TokenAlertQueries extends BaseQueries<
  TokenAlert,
  TokenAlertCriteria,
  TokenAlertUpdate,
  TokenAlertCreateParams
> {
  protected readonly table = "token_price_alerts";
  protected readonly CRITERIA_COLUMN_MAP = {
    id: "id",
    discordId: "discord_id",
    tokenSymbol: "token_symbol",
    targetPrice: "target_price",
    createdAt: "created_at",
    direction: "direction",
  } as const;

  constructor(db: Pool) {
    super(db);
  }
}
