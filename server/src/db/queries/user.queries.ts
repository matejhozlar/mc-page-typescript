import type { Pool } from "pg";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves Minecraft username associated with a Discord user ID
   *
   * @param discordId - The Discord user ID to search for
   * @returns Promise resolving to the Minecraft username
   * @throws Error if no user is found with the specified Discord ID
   */
  async getNameByDiscordId(discordId: string): Promise<string> {
    const result = await this.db.query<{ name: string }>(
      `SELECT name FROM users WHERE discord_id = $1`,
      [discordId]
    );

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    return result.rows[0].name;
  }

  /**
   * Retrieves the total number of registered users in the database
   *
   * @returns Promise resolving to the count of users
   * @throws Error if the count query fails or returns no data
   */
  async getCount(): Promise<number> {
    try {
      const result = await this.db.query(`SELECT COUNT(*) FROM users`);

      if (!result.rows[0].count) {
        throw new Error("No data found");
      }

      return result.rows[0].count;
    } catch (error) {
      logger.error("Failed to get user count:", error);
      throw error;
    }
  }

  /**
   * Checks whether a user with the specified Discord ID exists in the database
   *
   * @param discordId - The Discord ID to check
   * @returns Promise resolving to true if the user exists, false otherwise
   */
  async existsByDiscordId(discordId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT EXISTS(
        SELECT 1 FROM users WHERE discord_id = $1 
      )`,
      [discordId]
    );

    return Boolean(result.rows[0]?.exists);
  }
}
