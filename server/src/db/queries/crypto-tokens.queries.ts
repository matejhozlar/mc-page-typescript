import type { Pool } from "pg";
import type { CryptoToken } from "@/types/models/crypto-token.types";
import logger from "@/logger";

export class CryptoTokenQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves all active memecoins that have not crashed and have a positive price
   *
   * @returns Promise resolving to an array of active crypto tokens with memecoin status
   */
  async getActiveMemecoins(): Promise<CryptoToken[]> {
    const result = await this.db.query<CryptoToken>(
      `SELECT id, name, symbol, description, total_supply, available_supply, price_per_unit, is_memecoin, crashed
         FROM crypto_tokens
         WHERE is_memecoin = true AND price_per_unit > 0`
    );

    return result.rows;
  }

  /**
   * Finds a specific crypto token by its unique indentifier
   *
   * @param id - The unique indentifier of the crypto token
   * @returns Promise resolving to the token if found, null otherwise
   */
  async findById(id: number): Promise<CryptoToken | null> {
    const result = await this.db.query<CryptoToken>(
      `SELECT id, name, symbol, description, total_supply, available_supply, price_per_unit, is_memecoin, crashed
         FROM crypto_tokens
         WHERE id = $1
         LIMIT 1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Updates the price per unit for a specific crypto token
   *
   * @param id - The unique identifier of the token to update
   * @param newPrice - The new price value as a string (for precision)
   * @returns Promise resolving when the update is complete
   * @throws Error if the token is not found or update fails
   */
  async updatePrice(id: number, newPrice: string): Promise<void> {
    const result = await this.db.query(
      `UPDATE crypto_tokens
         SET price_per_unit = $1
         WHERE id = $2`,
      [newPrice, id]
    );

    if (result.rowCount === 0) {
      throw new Error(`Failed to update price for token ID: ${id}`);
    }
  }

  /**
   * Marks a memecoin as crashed by setting its price to zero and recording the crash timestamp
   *
   * @param id - The unique identifier of the memecoin to crash
   * @returns Promise resolving when the crash is recorded
   * @throws Error if the token is not found or the operation fails
   */
  async crashMemecoin(id: number): Promise<void> {
    const result = await this.db.query(
      `UPDATE crypto_tokens
         SET price_per_unit = 0, crashed = NOW()
         WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error(`Failed to crash memecoin with ID: ${id}`);
    }

    logger.info(`Token ID ${id} auto-crashed due to price below threshold`);
  }

  /**
   * Removes crashed memecoins from the database that have been in the crashed state for more than 24 hours
   *
   * @returns Promise resolving to the count of deleted records
   * @throws Error if the database operation fails
   */
  async deleteCrashedMemecoins(): Promise<number> {
    try {
      const { rowCount } = await this.db.query(
        `DELETE FROM crypto_tokens
                 WHERE is_memecoin = true
                    AND crashed IS NOT NULL
                    AND crashed < NOW() - INTERVAL '24 hours'`
      );

      if (rowCount && rowCount > 0) {
        logger.info(
          `Deleted ${rowCount} crashed memecoin(s) older than 24 hours`
        );
      }

      return rowCount ?? 0;
    } catch (error) {
      logger.error("Failed to delete crashed memecoins:", error);
      throw error;
    }
  }
}
