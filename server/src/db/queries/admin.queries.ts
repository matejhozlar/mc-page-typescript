import type { Pool } from "pg";
import type { Admin } from "@/types/models/admin";
import logger from "@/logger";

export class AdminQueries {
  constructor(private db: Pool) {}

  /**
   * Finds an admin by Discord ID
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

  /**
   * Creates a new admin
   */
  async create(discordId: string): Promise<Admin> {
    try {
      const result = await this.db.query<Admin>(
        `INSERT INTO admins (discord_id)
         VALUES ($1)
         RETURNING *`,
        [discordId]
      );

      logger.info("Admin created:", discordId);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create admin:", error);
      throw error;
    }
  }

  /**
   * Updates an admin's vanished status
   */
  async updateVanished(
    discordId: string,
    vanished: boolean
  ): Promise<Admin | null> {
    try {
      const result = await this.db.query<Admin>(
        `UPDATE admins
         SET vanished = $2
         WHERE discord_id = $1
         RETURNING *`,
        [discordId, vanished]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update admin vanished status:", error);
      throw error;
    }
  }

  /**
   * Deletes an admin
   */
  async delete(discordId: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM admins WHERE discord_id = $1`,
        [discordId]
      );

      if ((result.rowCount ?? 0) > 0) {
        logger.info("Admin deleted:", discordId);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete admin:", error);
      throw error;
    }
  }
}
