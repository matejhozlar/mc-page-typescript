import { Waitlist } from "@/types/models/waitlist.types";
import logger from "@/logger";
import type { Pool } from "pg";

export class WaitlistQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves a waitlist entry by its unique identifier
   *
   * @param id - The unique identifier of the waitlist entry
   * @returns Promise resolving to the waitlist entry if found, null otherwise
   * @throws Error if the database query fails
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
   * Updates the invitation token for a waitlist entry, marking it as invited
   *
   * @param id - The unique identifier of the waitlist entry to update
   * @param token - The generated invitation token to assign
   * @returns Promise resolving when the update is complete
   * @throws Error if no waitlist entry is found with the specified ID or update fails
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
