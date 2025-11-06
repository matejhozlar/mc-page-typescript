import { Pool } from "pg";
import type { WaitlistEmail } from "@/types/models/waitlist";
import logger from "@/logger";

export class WaitlistQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a waitlist entry by ID
   */
  async findById(id: number): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `SELECT id, email, submitted_at, token, discord_name
                 FROM waitlist_emails
                 WHERE id = $1
                 LIMIT 1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find waitlist entry by ID", error);
      throw error;
    }
  }

  /**
   * Finds a waitlist entry by email
   */
  async findByEmail(email: string): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `SELECT id, email, submitted_at, token, discord_name
             FROM waitlist_emails
             WHERE email = $1
             LIMIT 1`,
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find waitlist entry by email:", error);
      throw error;
    }
  }

  /**
   * Finds a waitlist entry by token
   */
  async findByToken(token: string): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `SELECT id, email, submitted_at, token, discord_name
             FROM waitlist_emails
             WHERE token = $1
             LIMIT 1`,
        [token]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find waitlist entry by token:", error);
      throw error;
    }
  }

  /**
   * Gets all waitlist entries
   *
   * @param invitedOnly - If true, only return entries with tokens (invited users)
   * @param pendingOnly - If true, only return entries without tokens (pending users)
   */
  async getAll(
    invitedOnly = false,
    pendingOnly = false
  ): Promise<WaitlistEmail[]> {
    try {
      let query = `SELECT * FROM waitlist_emails`;
      const conditions: string[] = [];

      if (invitedOnly) {
        conditions.push("token IS NOT NULL");
      }
      if (pendingOnly) {
        conditions.push("token IS NULL");
      }

      if (conditions.length > 0) {
        query += `WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY submitted_at ASC`;

      const result = await this.db.query<WaitlistEmail>(query);
      return result.rows;
    } catch (error) {
      logger.error("Failed to get all waitlist entries", error);
      throw error;
    }
  }

  /**
   * Gets count of pending (uninvited) waitlist entires
   */
  async getPendingCount(): Promise<Number> {
    try {
      const result = await this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count
             FROM waitlist_emails
             WHERE token IS NULL`
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error("Failed to get pending waitlist count:", error);
      throw error;
    }
  }

  /**
   * Creates a new waitlist entry
   */
  async create(email: string, discordName?: string): Promise<WaitlistEmail> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `INSERT INTO waitlist_emails (email, discord_name)
             VALUES ($1, $2)
             RETURNING *`,
        [email, discordName || null]
      );

      logger.info("New waitlist entry created:", email);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create waitlist entry:", error);
      throw error;
    }
  }

  /**
   * Updates the token for a waitlist entry (marks as invited)
   */
  async updateToken(id: number, token: string): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `UPDATE waitlist_emails
             SET token = $2
             WHERE id = $1
             RETURNING *`,
        [id, token]
      );

      if (result.rows[0]) {
        logger.info("Token updated for waitlist entry ID:", id);
      }

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update waitlist token:", error);
      throw error;
    }
  }

  /**
   * Updates the Discord name for a waitlist entry
   */
  async updateDiscordName(
    id: number,
    discordName: string
  ): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `UPDATE waitlist_emails
             SET discord_name = $1
             WHERE id = $1
             RETURNING *`,
        [id, discordName]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update Discord name:", error);
      throw error;
    }
  }

  /**
   * Checks if an email already exists in the waitlist
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        `SELECT 1 FROM waitlist_emails WHERE email = $1 LIMIT 1`,
        [email]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to check if email exists:", error);
      throw error;
    }
  }

  /**
   * Checks if a user was already invited (has a token)
   */
  async isInvited(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `SELECT 1 FROM waitlist_emails WHERE id = $1 AND token IS NOT NULL LIMIT 1`,
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to check if user is invited:", error);
      throw error;
    }
  }

  /**
   * Deletes a waitlist entry
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM waitlist_emails WHERE id = $1`,
        [id]
      );

      if ((result.rowCount ?? 0) > 0) {
        logger.info("Waitlist entry deleted: ID", id);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete waitlist entry:", error);
      throw error;
    }
  }

  /**
   * Gets the next pending (uninvited) user in the queue
   */
  async getNextPending(): Promise<WaitlistEmail | null> {
    try {
      const result = await this.db.query<WaitlistEmail>(
        `SELECT *
             FROM waitlist_emails
             WHERE token IS NULL
             ORDER BY submitted_at ASC
             LIMIT 1`
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to get next pending waitlist entry:", error);
      throw error;
    }
  }
}
