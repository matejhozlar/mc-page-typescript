import { Waitlist } from "@/types/models/waitlist.types";
import logger from "@/logger";
import type { Pool } from "pg";

export class WaitlistQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a waitlist entry by ID
   *
   * @param id - The ID of the waitlist entry to look for
   *
   * @returns The waitlist entry
   */
  async findById(id: number): Promise<Waitlist | null> {
    try {
      const result = await this.db.query<Waitlist>(
        `SELECT id, email, submitted_at, token, discord_name
       FROM waitlist_emails
       WHERE id = $1
       LIMIT 1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find waitlist entry by ID:", error);
      throw error;
    }
  }

  /**
   * Updates the token for a waitlist entry (marks as invited)
   *
   * @param id - The ID of the waitlist entry to update
   * @param token - The generated token to assign to the waitlist entry
   */
  async updateToken(id: number, token: string): Promise<void> {
    const result = await this.db.query(
      `UPDATE waitlist_emails
       SET token = $2
       WHERE id = $1`,
      [id, token]
    );

    if (result.rowCount === 0) {
      throw new Error("Failed to update token for waitlist entry");
    }

    logger.info("Token updated for entry ID:", id);
  }
}
