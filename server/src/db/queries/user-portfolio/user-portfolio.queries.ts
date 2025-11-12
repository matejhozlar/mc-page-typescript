import type { Pool } from "pg";
import type {
  UserPortfolio,
  UserPortfolioCreate,
} from "./user-portfolio.types";
import { BaseQueries } from "../base.queries";

type UserPortfolioIdentifier = { id: number };

type UserPortfolioFilters =
  | { discordId: string }
  | { totalValue: string }
  | { recordedAt: Date };

type UserPortfolioUpdate =
  | { discordId: string }
  | { totalValue: string }
  | { recordedAt: Date };

export class UserPortfolioQueries extends BaseQueries<
  UserPortfolio,
  UserPortfolioIdentifier,
  UserPortfolioFilters,
  UserPortfolioUpdate,
  UserPortfolioCreate
> {
  protected readonly table = "user_portfolio_history";

  constructor(db: Pool) {
    super(db);
  }
}
