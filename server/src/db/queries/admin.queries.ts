import type { Pool } from "pg";
import type { Admin } from "@/types/models/admin";
import logger from "@/logger";

export class AdminQueries {
  constructor(private db: Pool) {}

  /**
   * Finds an admin by Discord ID
   *
   * @param discordId - Discord ID to look for
   * @returns Returns the Admin from DB
   */
  async findByDiscordId(discordId: string): Promise<Admin | null> {
    try {
      const result = await this.db.query<Admin>(
        `SELECT id, discord_id, created_at, vanished
         FROM admins
         WHERE discord_id = $1
         LIMIT 1`,
        [discordId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find admin by Discord ID:", error);
      throw error;
    }
  }

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
      return false;
    }
  }

  /**
   * Gets all admins
   *
   * @returns All admins from DB
   */
  async getAll(): Promise<Admin[]> {
    try {
      const result = await this.db.query<Admin>(
        `SELECT * FROM admins BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      logger.error("Failed to get all admins:", error);
      throw error;
    }
  }
}
