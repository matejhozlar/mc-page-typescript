import type { Pool } from "pg";
import logger from "@/logger";
import { UserPortfolioHistory } from "@/types/models/user-portfolio-histroy.types";

export class UserPortfolioQueries {
  constructor(private db: Pool) {}

  /**
   * Creates a persists a new Portfolio history entry for a user
   *
   * @param discordId - The Discord user ID to create new entry for
   * @param totalValue - The amount to log
   * @returns Promise resolving when the portfolio entry is created
   */
  async create(discordId: string, totalValue: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_portfolio_history (discord_id, total_value)
             VALUES ($1, $2)`,
      [discordId, totalValue]
    );

    logger.info("Portfolio snapshot created for Discord ID:", discordId);
  }

  /**
   * Retrieves portfolio history for a specific user
   *
   * @param discordId - The Discord user ID to retrieve histroy for
   * @param limit - Maximum number of records to return (default: 30)
   * @returns Promise resolving to array of portfolio history entries
   */
  async getHistory(
    discordId: string,
    limit: number = 30
  ): Promise<UserPortfolioHistory[]> {
    const result = await this.db.query<UserPortfolioHistory>(
      `SELECT id, discord_id, total_value, recorded_at
       FROM user_portfolio_history
       WHERE discord_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [discordId, limit]
    );

    return result.rows;
  }

  /**
   * Retrieves the latest portfolio value for a user
   *
   * @param discordId - The Discord user ID
   * @returns Promise resolving to the most recent portfolio entry, null otherwise
   */
  async getLatest(discordId: string): Promise<UserPortfolioHistory | null> {
    const result = await this.db.query<UserPortfolioHistory>(
      `SELECT id, discord_id, total_value, recorded_at
       FROM user_portfolio_history
       WHERE discord_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [discordId]
    );

    return result.rows[0] || null;
  }

  /**
   * Deletes old portfolio history entries beyoned a certain retention period
   *
   * @param daysToKeep - Number of days of history to retain (default: 90)
   * @returns Promise resolving to the number of deleted entries
   */
  async cleanup(daysToKeep: number = 90): Promise<number> {
    try {
      const result = await this.db.query(
        `DELETE FROM user_portfolio_history
             WHERE recorded_at < NOW() - INTERVAL '1 day' * $1`,
        [daysToKeep]
      );

      const deletedCount = result.rowCount ?? 0;

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} portfolio history entries`);
      }

      return deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup old portfolio entries:", error);
      throw error;
    }
  }
}
