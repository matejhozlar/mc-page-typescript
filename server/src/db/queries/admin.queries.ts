import type { Pool } from "pg";
import logger from "@/logger";

export class AdminQueries {
  constructor(private db: Pool) {}

  /**
   * Checks if a Discord ID belongs to an admin
   *
   * @param discordId - Discord ID to look for
   * @returns True if the user is an admin
   */
  async isAdmin(discordId: string): Promise<boolean> {
    if (!discordId) return false;

    try {
      const result = await this.db.query(
        `SELECT 1 FROM admins WHERE discord_id = $1`,
        [discordId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Admin check failed:", error);
      throw error;
    }
  }
}
