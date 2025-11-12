import type { Pool } from "pg";
import type { UserToken, UserTokenCreate } from "./user-token.types";
import { BaseQueries } from "../base.queries";

type UserTokenIdentifier = { discordId: string; tokenId: number };

type UserTokenFilters =
  | { discordId: string }
  | { tokenId: number }
  | { amount: string }
  | { price_at_purchase: string };

type UserTokenUpdate = UserTokenFilters;

export class UserTokenQueries extends BaseQueries<
  UserToken,
  UserTokenIdentifier,
  UserTokenFilters,
  UserTokenUpdate,
  UserTokenCreate
> {
  protected readonly table = "user_tokens";

  constructor(db: Pool) {
    super(db);
  }
}
