import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { UserPortfolio, UserPortfolioCreate } from "./types";
import { UserTokenWithPrice } from "../token";
import logger from "@/logger";

type Identifier = { id: number };

type Filters = { discordId: string; totalValue: string; recordedAt: Date };

type Update = Filters;

export class UserPortfolioQueries extends BaseQueries<{
  Entity: UserPortfolio;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: UserPortfolioCreate;
}> {
  protected readonly table = "user_portfolios";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves all user tokens with current price information
   *
   * @param discordId - The Discord user ID to look for
   * @returns Promise resolving to an array of tokens with current prices
   */
  async findWithPrices(discordId: string): Promise<UserTokenWithPrice[]> {
    const result = await this.db.query<UserTokenWithPrice>(
      `SELECT ut.discord_id, ut.token_id, ut.amount, ut.price_at_purchase, ct.price_per_unit
       FROM user_tokens ut
       JOIN crypto_tokens ct ON ut.token_id = ct.id
       WHERE ut.discord_id = $1`,
      [discordId]
    );

    return result.rows;
  }

  /**
   * Calculates the total portfolio value for a user based on the current token prices
   *
   * @param discordId - The Discord user ID to look for
   * @returns Promise resolving to the total portfolio value as a string
   */
  async value(discordId: string): Promise<string> {
    const tokens = await this.findWithPrices(discordId);

    const totalValue = tokens.reduce((sum, token) => {
      return sum + parseFloat(token.amount) * parseFloat(token.price_per_unit);
    }, 0);

    return totalValue.toFixed(2);
  }

  /**
   * Deletes old portfolio history entries beyond retention period
   *
   * @param daysToKeep - Number of days of history to retain (default: 90)
   * @returns Promise resolving to the number of deleted entries
   */
  async cleanup(daysToKeep: number = 90): Promise<number> {
    try {
      const result = await this.db.query(
        `DELETE FROM ${this.table}
                WHERE recorded_at < NOW() - INTERVAL '1 day' * $1`,
        [daysToKeep]
      );

      const deletedCount = result.rowCount ?? 0;

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} ${this.table} entries`);
      }

      return deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup old portfolio entries:", error);
      throw error;
    }
  }
}
