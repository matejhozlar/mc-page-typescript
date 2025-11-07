import type { Pool } from "pg";
import type { User } from "@/types/models/user";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a user by Discord ID
   *
   * @param discordId - Discord ID to look for
   */
  async findByDiscordId(discordId: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        `SELECT * FROM users WHERE discord_id = $1 LIMIT 1`,
        [discordId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to get user by discord ID:", error);
      throw error;
    }
  }
}
