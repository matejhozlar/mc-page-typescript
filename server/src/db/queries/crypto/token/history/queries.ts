import { Pool } from "pg";
import {
  CryptoTokenHistory,
  CryptoTokenHistoryCreate,
  CryptoTokenHistoryRow,
  CryptoTokenHistoryTable,
} from "./types";
import { BaseQueries } from "@/db/queries/base.queries";
import logger from "@/logger";

type Identifier = { id: number };

type Filters = {
  tokenId: number;
  price: string;
  recordedAt: Date;
};

export class CryptoTokenHistoryQueries extends BaseQueries<{
  Entity: CryptoTokenHistory;
  DbEntity: CryptoTokenHistoryRow;
  Identifier: Identifier;
  Filters: Filters;
  Create: CryptoTokenHistoryCreate;
}> {
  protected readonly table = "";
  constructor(db: Pool) {
    super(db);
  }

  /**
   * Creates and persists a new history record in the specified granularity table
   * Overrides base create() to support dynamic table selection
   *
   * @param table - The specific history table to insert into
   * @param data - Object containing creation data
   * @returns Promise resolving when the record is created
   */
  async createInTable(
    table: CryptoTokenHistoryTable,
    data: CryptoTokenHistoryCreate
  ): Promise<void> {
    const createMappings = this.getCreateMapping(data);

    const columns = createMappings.map((m) => m.column).join(", ");
    const placeholders = createMappings
      .map((_, index) => `$${index + 1}`)
      .join(", ");

    const values = createMappings.map((m) => m.value);

    const query = `
        INSERT INTO ${table} (${columns})
        VALUES (${placeholders})
        RETURNING *
    `;

    try {
      await this.db.query(query, values);
    } catch (error) {
      logger.error(`Failed to create ${table}:`, error);
      throw error;
    }
  }

  /**
   * Checks if an hourly snapshot exists within the last 55 minutes
   *
   * @param table - The specific history table to look into
   * @param tokenId - The ID to look for
   * @returns True if the entry within the last 55 minutes exists, false otherwise
   */
  async hasRecent(
    table: CryptoTokenHistoryTable,
    tokenId: number
  ): Promise<boolean> {
    try {
      const result = await this.db.query<{ exists: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM ${table} WHERE token_id = $1 AND recorded_at > NOW() - INTERVAL '55 minutes')`,
        [tokenId]
      );

      return Boolean(result.rows[0].exists);
    } catch (error) {
      logger.error(`Failed to check recent for ${table}:`, error);
      throw error;
    }
  }

  /**
   * Gets the oldest minute history entry beyond the 100th entry (for trimming)
   *
   * @param tokenId - The ID to look for
   * @param limit - How many entries to return
   * @returns Promise resolving to the entry or null
   */
  async getOldestMinuteEntry(
    tokenId: number,
    limit: number = 100
  ): Promise<CryptoTokenHistory | null> {
    const result = await this.db.query<CryptoTokenHistoryRow>(
      `SELECT id, token_id, price, recorded_at
       FROM token_price_history_minutes
       WHERE token_id = $1
       ORDER BY recorded_at ASC
       LIMIT 1 OFFSET $2`,
      [tokenId, limit - 1]
    );
    return result.rows[0] ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Deletes the oldest N minute history entries for a token
   *
   * @param tokenId - The ID to look for
   * @param count - Number of entries to delete
   * @returns Promise resolving when the deletion is complete
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
   * @param table - The table to clean
   * @param maxEntries - Max number of rows to keep per token
   * @param deleteBatch - Number of extra rows to delete in a batch (soft buffer)
   * @returns Promise resolving when the cleaning is complete
   */
  async cleanup(
    table: CryptoTokenHistoryTable,
    maxEntries: number,
    deleteBatch: number
  ): Promise<void> {
    try {
      const { rows } = await this.db.query<{ token_id: number; count: string }>(
        `SELECT token_id, COUNT(*) AS count
                FROM ${table}
                GROUP BY token_id`
      );

      for (const row of rows) {
        const tokenId = row.token_id;
        const count = parseInt(row.count, 10);

        if (count > maxEntries) {
          const toDelete = count - maxEntries + deleteBatch;

          await this.db.query(
            `DELETE FROM ${table}
                WHERE ctid IN (
                    SELECT ctid FROM ${table} 
                    WHERE token_id = $1
                    ORDER BY recorded_at ASC
                    LIMIT $2
                )`,
            [tokenId, toDelete]
          );

          logger.info(
            `Cleaned ${toDelete} rows from ${table} for token ${tokenId}`
          );
        }
      }
    } catch (error) {
      logger.error(`Failed to clean ${table}:`, error);
      throw error;
    }
  }
}
