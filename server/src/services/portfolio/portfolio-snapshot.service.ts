import logger from "@/logger";
import { userTokenQueries, userPortfolioQueries } from "@/db";

/**
 * Service for managing user portfolio snapshots
 */
export class PortfolioSnapshotService {
  constructor() {}

  /**
   * Takes a snapshot of a single user's portfolio value
   *
   * @param discordId - The Discord user ID
   * @returns Promise resolving to the calculated portfolio value
   */
  async snapshotUser(discordId: string): Promise<string> {
    try {
      const totalValue = await userTokenQueries.calculatePortfolioValue(
        discordId
      );
      await userPortfolioQueries.create(discordId, totalValue);

      logger.info(`Portfolio snapshot created for ${discordId}: ${totalValue}`);

      return totalValue;
    } catch (error) {
      logger.error(`Failed to snapshot portfolio for ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Takes a daily snapshot of all users' crypto portfolio values
   * by summing the value of their current token holdings
   *
   * Inserts record into the user_portfolio_history table for each user
   *
   * @returns Promise resolving to the number of snapshots created
   */
  async snapshotAllUsers(): Promise<number> {
    try {
      const userIds = await userTokenQueries.findUsersWithTokens();

      if (userIds.length === 0) {
        logger.info("No users with token holdings found for snapshot");
        return 0;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const discordId of userIds) {
        try {
          await this.snapshotUser(discordId);
          successCount++;
        } catch (error) {
          logger.error(`Failed to snapshot user ${discordId}:`, error);
          errorCount++;
        }
      }

      logger.info(
        `Daily user portfolio snapshot completed: ${successCount} successful, ${errorCount} failed`
      );

      return successCount;
    } catch (error) {
      logger.error("Failed to record daily portfolio snapshots:", error);
      throw error;
    }
  }

  /**
   * Gets the portfolio value history for a user
   *
   * @param discordId - The Discord user ID
   * @param limit - Maxmimum number of records to return
   * @returns Promise resolving to array of portfolio history entires
   */
  async getUserHistory(discordId: string, limit?: number) {
    return userPortfolioQueries.getHistory(discordId, limit);
  }

  /**
   * Gets the latest portfolio value for a user
   *
   * @param discordId - The Discord user ID
   * @returns Promise resolving to the most recent portfolio entry
   */
  async getUserLatest(discordId: string) {
    return userPortfolioQueries.getLatest(discordId);
  }

  /**
   * Cleans up old portfolio history entries
   *
   * @param daysToKeep - Number of days of history to retain
   * @returns Promise resolving to the number of deleted entries
   */
  async cleanup(daysToKeep?: number) {
    return userPortfolioQueries.cleanup(daysToKeep);
  }
}
