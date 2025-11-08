import type { Pool } from "pg";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}

  /**
   * Get Minecraft username based on Discord ID
   *
   * @param discordId - The Discord ID to look for
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
   * Get number of users in DB
   *
   * @returns Number of users
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
}
