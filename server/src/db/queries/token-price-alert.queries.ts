import type { Pool } from "pg";
import { TokenAlert } from "./token-alert/token-alert.types";
import logger from "@/logger";

export class TokenPriceAlertQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves all price alerts configured for a specific cryptocurrency token symbol
   *
   * @param symbol - The token symbol to search for (eg. "RGC", "PLC")
   * @returns Promise resolving to an array of price alerts for the specified token
   */
  async findBySymbol(symbol: string): Promise<TokenAlert[]> {
    const result = await this.db.query<TokenAlert>(
      `SELECT id, discord_id, token_symbol, target_price, created_at, direction
             FROM token_price_alerts
             WHERE token_symbol = $1`,
      [symbol]
    );

    return result.rows;
  }

  /**
   * Retrieves all price alerts for a token by looking up its ID and matching the symbol
   *
   * @param tokenId - The unique identifier of the crypto token
   * @returns Promise resolving to an array of price alerts associated with the token
   */
  async findByTokenId(tokenId: number): Promise<TokenAlert[]> {
    const result = await this.db.query<TokenAlert>(
      `SELECT tpa.id, tpa.discord_id, tpa.token_symbol, tpa.target_price, tpa.created_at, tpa.direction
         FROM token_price_alerts
         WHERE tpa.token_symbol = (
            SELECT symbol FROM crypto_tokens WHERE id = $1
         )`,
      [tokenId]
    );

    return result.rows;
  }

  /**
   * Deletes a specific price alert from the database
   *
   * @param id - The unique identifier of the alert to delete
   * @returns Promise resolving when the deletion is complete
   * @throws Error if no alert is found with the specified ID
   */
  async delete(id: number): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM token_price_alerts WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error(`Alert not found with ID: ${id}`);
    }
  }

  /**
   * Deletes all price alerts associated with a specified token symbol
   *
   * @param symbol - The token symbol whose alerts should be deleted
   * @returns Promise resolving to the count of deleted alert records
   */
  async deleteBySymbol(symbol: string): Promise<number> {
    const result = await this.db.query(
      `DELETE FROM token_price_alerts WHERE token_symbol = $1`,
      [symbol]
    );

    return result.rowCount ?? 0;
  }
}
