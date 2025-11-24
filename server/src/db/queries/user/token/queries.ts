import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { UserToken, UserTokenCreate, UserTokenRow } from "./types";

type Identifier = { discordId: string } | { tokenId: number };

type Filters = {
  amount: string;
  priceAtPurchase: string;
};

type Update = Filters;

export class UserTokenQueries extends BaseQueries<{
  Entity: UserToken;
  DbEntity: UserTokenRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: UserTokenCreate;
}> {
  protected readonly table = "user_tokens";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves all distinct users who currently hold any tokens
   *
   * @returns Promise resolving to an array of Discord user IDs with token holdings
   */
  async findHolders(): Promise<string[]> {
    const result = await this.db.query<{ discord_id: string }>(
      `SELECT DISTINCT discord_id FROM ${this.table} WHERE AMOUNT > 0`
    );

    return result.rows.map((row) => row.discord_id);
  }
}
