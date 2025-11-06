import { Pool } from "pg";
import {
  Ticket,
  TicketCounter,
  TicketCreateParams,
} from "@/types/models/ticket";
import logger from "@/logger";

export class TicketQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a ticket by its ID
   *
   * @param {number} id - Ticket ID to look for
   * @returns The ticket from DB or null
   */
  async findById(id: number): Promise<Ticket | null> {
    try {
      const result = await this.db.query<Ticket>(
        `SELECT * FROM tickets WHERE id = $1 LIMIT 1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find ticket by ID:", error);
      throw error;
    }
  }

  /**
   * Finds a ticket by channel ID
   *
   * @param {string} channelId - Discord channel ID to look for
   * @returns The ticket from DB or null
   */
  async findChannelId(channelId: string): Promise<Ticket | null> {
    try {
      const result = await this.db.query<Ticket>(
        `SELECT * FROM tickets WHERE channel_id = $1`,
        [channelId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find ticket by channel ID:", error);
      throw error;
    }
  }

  /**
   * Gets all tickets with optional status filter
   *
   * @param {string} status - Optional filter (`open` or `closed`)
   * @returns {Ticket[]} All tickets from DB
   */
  async getAll(status?: string): Promise<Ticket[]> {
    try {
      let query = `SELECT * FROM tickets`;
      const params: any[] = [];

      if (status) {
        query += ` WHERE status = $1`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await this.db.query<Ticket>(query, params);
      return result.rows;
    } catch (error) {
      logger.error("Failed to get all tickets:", error);
      throw error;
    }
  }

  /**
   * Updates the admin message ID for a ticket
   *
   * @param {string} channelId - Discord channel ID
   * @param {string} adminMessageId - Admin panel message ID
   * @returns The updated ticket or null
   */
  async updateAdminMessageId(
    channelId: string,
    adminMessageId: string
  ): Promise<Ticket | null> {
    try {
      const result = await this.db.query<Ticket>(
        `UPDATE tickets
             SET admin_message_id = $1, updated_at = NOW()
             WHERE channel_id = $2
             RETURNING *`,
        [adminMessageId, channelId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update admin message ID:", error);
      throw error;
    }
  }

  /**
   * Gets user tickets by Discord ID
   *
   * @param {string} discordId - Discord ID to look for
   * @returns {Ticket} Existing ticket or null
   */
  async hasTicketByDiscordId(discordId: string): Promise<Ticket | null> {
    try {
      const result = await this.db.query<Ticket>(
        `SELECT * FROM tickets WHERE discord_id = $1 AND status != 'deleted' LIMIT 1`,
        [discordId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to get ticket by discord ID:", error);
      throw error;
    }
  }

  /**
   * Atomically increments and returns the next ticket number.
   */
  async nextTicketNumber(): Promise<number> {
    try {
      const result = await this.db.query<TicketCounter>(
        `UPDATE ticket_counter
       SET last_number = last_number + 1
       WHERE id = 1
       RETURNING last_number`,
        []
      );

      if (result.rowCount !== 1) {
        throw new Error("No ticket_counter row updated");
      }
      return result.rows[0].last_number;
    } catch (error) {
      logger.error("Failed to increment ticket number:", error);
      throw error;
    }
  }
}
