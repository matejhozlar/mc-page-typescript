import type { Pool } from "pg";
import logger from "@/logger";
import { UserToken, UserTokenWithPrice } from "@/types/models/user-token.types";

export class UserTokenQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves all tokens held by a specific user
   *
   * @param discordId - The Discord user ID to look for
   * @returns Promise resolving to array of user's token holdings
   */
  async findByDiscordId(discordId: string): Promise<UserToken[]> {
    const result = await this.db.query<UserToken>(
      `SELECT discord_id, token_id, amount, price_at_purchase
       FROM user_tokens
       WHERE discord_id = $1`,
      [discordId]
    );

    return result.rows;
  }

  /**
   * Retrieves all users who hold a specific token
   *
   * @param tokenId - The crypto token ID to look for
   * @returns Promise resolving to array user holdings for the token
   */
  async findByTokenId(tokenId: string): Promise<UserToken[]> {
    const result = await this.db.query<UserToken>(
      `SELECT discord_id, token_id, amount, price_at_purchase
       FROM user_tokens
       WHERE token_id = $1 AND amount > 0`,
      [tokenId]
    );

    return result.rows;
  }

  /**
   * Retrieves all user tokens with currenct price information
   *
   * @param discordId - The Discord user ID to look for
   * @returns Promise resolving to array of tokens with current prices
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
   * Retrieves all distinct users who currently hold any tokens
   *
   * @returns Promise resolving to array of Discord IDs with token holdings
   */
  async findUsersWithTokens(): Promise<string[]> {
    const result = await this.db.query<{ discord_id: string }>(
      `SELECT DISTINCT discord_id 
       FROM user_tokens 
       WHERE amount > 0`
    );

    return result.rows.map((row) => row.discord_id);
  }

  /**
   * Calculates the total portfolio value for a user based on the current token prices
   *
   * @param discordId - The Discord user ID to look for
   * @returns Promise resolving to the total portfolio value as a string
   */
  async calculatePortfolioValue(discordId: string): Promise<string> {
    const tokens = await this.findWithPrices(discordId);

    const totalValue = tokens.reduce((sum, token) => {
      return sum + parseFloat(token.amount) * token.price_per_unit;
    }, 0);

    return totalValue.toFixed(2);
  }

  /**
   * Updates the amount of a specific token for a user
   *
   * @param discordId - The Discord user ID to update
   * @param tokenId - The crypto token ID
   * @param amount - The new amount
   * @returns Promise resolving when the update is complete
   */
  async updateAmount(
    discordId: string,
    tokenId: number,
    amount: string
  ): Promise<void> {
    const result = await this.db.query(
      `UPDATE user_tokens
       SET amount = $3
       WHERE discord_id = $1 AND token_id = $2`,
      [discordId, tokenId, amount]
    );

    if (result.rowCount === 0) {
      throw new Error(
        `User token not found for Discord ID: ${discordId}, token ID: ${tokenId}`
      );
    }

    logger.info(
      `Updated token amount for user ${discordId}, token ${tokenId}:`,
      amount
    );
  }
}
