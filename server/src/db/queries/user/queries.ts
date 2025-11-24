import { BaseQueries } from "../base.queries";
import { User, UserCreate, UserRow } from "./types";
import { Pool } from "pg";
import { UserBalanceQueries } from "./balance";
import { UserPortfolioQueries } from "./portfolio";
import { UserTokenQueries } from "./token";

type Identifier = { uuid: string } | { name: string } | { discordId: string };

type Filters = {
  online: Boolean;
  lastSeen: Date;
  playTimeSeconds: string;
  sessionStart: Date;
  fistJoined: Date;
};

type Update = Filters;

export class UserQueries extends BaseQueries<{
  Entity: User;
  DbEntity: UserRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: UserCreate;
}> {
  protected readonly table = "users";

  private _balance?: UserBalanceQueries;

  private _portfolio?: UserPortfolioQueries;

  private _token?: UserTokenQueries;

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves a Minecraft username for a user
   *
   * @param identifier - Object with discordId, uuid, or name
   * @returns Promise resolving to the Minecraft username
   * @throws Error if user is not found
   */
  async name(identifier: Identifier): Promise<string> {
    const user = await this.get(identifier);
    return user.name;
  }

  get balance(): UserBalanceQueries {
    if (!this._balance) {
      this._balance = new UserBalanceQueries(this.db);
    }
    return this._balance;
  }

  get portfolio(): UserPortfolioQueries {
    if (!this._portfolio) {
      this._portfolio = new UserPortfolioQueries(this.db);
    }
    return this._portfolio;
  }

  get token(): UserTokenQueries {
    if (!this._token) {
      this._token = new UserTokenQueries(this.db);
    }
    return this._token;
  }
}
