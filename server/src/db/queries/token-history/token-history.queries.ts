import type { Pool } from "pg";
import logger from "@/logger";
import type { TokenHistory } from "./token-history.types";

export class TokenHistoryQueries {
  constructor(private db: Pool) {}

  /**
   * Adds a new minute-level price history entry
   *
   * @param tokenId - The ID of the token
   * @param price - The price of the token
   */
  async addMinuteEntry(tokenId: number, price: string): Promise<void> {
    await this.db.query(
      `INSERT INTO token_price_history_minutes (token_id, price)
         VALUES ($1, $2)`,
      [tokenId, price]
    );
  }

  /**
   * Adds a new hour-level price history entry
   *
   * @param tokenId - The ID of the token
   * @param price - The price of the token
   */
  async addHourlyEntry(tokenId: number, price: string): Promise<void> {
    await this.db.query(
      `INSERT INTO token_price_history_hourly (token_id, price)
       VALUES ($1, $2)`,
      [tokenId, price]
    );

    logger.info(`Hourly snapshot added for a memecoin ID ${tokenId}: ${price}`);
  }

  /**
   * Checks if an hourly snapshot exists within the last 55 minutes
   *
   * @param tokenId - The ID to look for
   */
  async hasRecentHourlySnapshot(tokenId: number): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM token_price_history_hourly
         WHERE token_id = $1 AND recorded_at > NOW() - INTERVAL '55 minutes'`,
      [tokenId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Gets the oldest minute history entry beyond the 100th entry (for trimming)
   *
   * @param tokenId - The ID to look for
   * @param limit - How many entries to return
   */
  async getOldestMinuteEntry(
    tokenId: number,
    limit: number = 100
  ): Promise<TokenHistory | null> {
    const result = await this.db.query<TokenHistory>(
      `SELECT id, token_id, price, recorded_at
       FROM token_price_history_minutes
       WHERE token_id = $1
       ORDER BY recorded_at ASC
       LIMIT 1 OFFSET $2`,
      [tokenId, limit - 1]
    );

    return result.rows[0] || null;
  }

  /**
   * Deletes the oldest N minute history entries for a token
   *
   * @param tokenId - The ID to look for
   * @param count - Number of entries to delete
   */
  async deleteOldestMinutesEntries(
    tokenId: number,
    count: number = 20
  ): Promise<void> {
    await this.db.query(
      `DELETE FROM token_price_history_minutes
       WHERE token_id = $1
       AND id IN (
         SELECT id FROM token_price_history_minutes
         WHERE token_id = $1
         ORDER BY recorded_at ASC
         LIMIT $2
       )`,
      [tokenId, count]
    );

    logger.info(`Trimmed ${count} old history entries for token ID ${tokenId}`);
  }

  /**
   * Cleans up a token history table by removing old rows beyond a maximum entry limit per token
   *
   * @param tableName - Name of the table to clean
   * @param maxEntries - Maximum number of rows to keep per token
   * @param deleteBatch - Number of extra rows to delete in a batch (soft buffer)
   */
  async cleanup(
    tableName:
      | "token_price_history_minutes"
      | "token_price_history_hourly"
      | "token_price_history_daily"
      | "token_price_history_weekly",
    maxEntries: number,
    deleteBatch: number
  ): Promise<void> {
    try {
      const { rows } = await this.db.query<{ token_id: number; count: string }>(
        `SELECT token_id, COUNT(*) AS count
             FROM ${tableName}
             GROUP BY token_id`
      );

      for (const row of rows) {
        const tokenId = row.token_id;
        const count = parseInt(row.count, 10);

        if (count > maxEntries) {
          const toDelete = count - maxEntries + deleteBatch;

          await this.db.query(
            `DELETE FROM ${tableName}
                 WHERE ctid IN (
                    SELECT ctid FROM ${tableName}
                    WHERE token_id = $1
                    ORDER BY recorded_at ASC
                    LIMIT $2
                 )`,
            [tokenId, toDelete]
          );

          logger.info(
            `Cleaned ${toDelete} rows from ${tableName} for token ${tokenId}`
          );
        }
      }
    } catch (error) {
      logger.error(`Failed to clean ${tableName}:`, error);
      throw error;
    }
  }
}
