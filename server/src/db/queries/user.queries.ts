import type { Pool } from "pg";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}

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
