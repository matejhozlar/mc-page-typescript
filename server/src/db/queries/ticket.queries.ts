import type { Pool } from "pg";
import type { Ticket, TicketCreateParams } from "@/types/models/ticket.types";
import logger from "@/logger";

export class TicketQueries {
  constructor(private db: Pool) {}

  /**
   * Finds an open ticket for user by his Discord ID
   *
   * @param discordId - The Discord ID to look for
   * @returns The existing ticket or null
   */
  async findOpenByDiscordId(discordId: string): Promise<Ticket | null> {
    const result = await this.db.query<Ticket>(
      `SELECT * FROM tickets WHERE discord_id = $1 AND status != 'deleted' LIMIT 1`,
      [discordId]
    );

    return result.rows[0] || null;
  }

  /**
   * Finds a ticket by channel ID
   *
   * @param channelId - The Discord ID to look for
   * @returns The ticket or null if not found
   */
  async findByChannelId(channelId: string): Promise<Ticket | null> {
    const result = await this.db.query<Ticket>(
      `SELECT * FROM tickets WHERE channel_id = $1 LIMIT 1`,
      [channelId]
    );

    return result.rows[0] || null;
  }

  /**
   * Updates the admin panel message ID for a ticket
   *
   * @param channelId - Discord channel ID
   * @param adminMessageId - Admin panel message ID
   */
  async updateAdminPanelId(
    channelId: string,
    adminMessageId: string
  ): Promise<void> {
    const result = await this.db.query(
      `UPDATE tickets
         SET admin_message_id = $1
         WHERE channel_id = $2`,
      [adminMessageId, channelId]
    );

    if (result.rowCount === 0) {
      throw new Error(
        `Failed to update admin panel message ID for ticket with channel_id: ${channelId}`
      );
    }

    logger.info(
      "Admin panel message ID updated for ticket channel:",
      channelId
    );
  }

  /**
   * Atomically increments and returns the next ticket number
   *
   * @returns Next ticket number
   */
  async getNext(): Promise<number> {
    const result = await this.db.query<{ last_number: number }>(
      `UPDATE ticket_counter 
     SET last_number = last_number + 1 
     WHERE id = 1 
     RETURNING last_number`,
      []
    );

    if (result.rowCount === 0) {
      throw new Error("Failed to get next ticket number");
    }

    return result.rows[0].last_number;
  }

  /**
   * Creates a new ticket, inserts it into DB
   *
   * @param params - Ticket creation parameters
   */
  async create(params: TicketCreateParams): Promise<void> {
    await this.db.query(
      `INSERT INTO tickets (ticket_number, discord_id, mc_name, channel_id)
         VALUES ($1, $2, $3, $4)`,
      [
        params.ticket_number,
        params.discord_id,
        params.mc_name,
        params.channel_id,
      ]
    );
  }

  /**
   * Marks a ticket as deleted
   *
   * @param channelId - The Discord channel ID of the ticket
   * @throws Error if ticket not found
   */
  async markAsDeleted(channelId: string): Promise<void> {
    const result = await this.db.query(
      `UPDATE tickets
         SET status = 'deleted', updated_at = NOW()
         WHERE channel_id = $1`,
      [channelId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Ticket not found with channel_id: ${channelId}`);
    }

    logger.info("Ticket marked as deleted:", channelId);
  }

  /**
   * Marks a ticket as open
   *
   * @param channelId - The Discord channel ID of the ticket
   * @throws Error if ticket not found
   */
  async markAsOpen(channelId: string): Promise<void> {
    const result = await this.db.query(
      `UPDATE tickets
         SET status = 'open', updated_at = NOW()
         WHERE channel_id = $1`,
      [channelId]
    );

    if (result.rowCount === 0) {
      throw new Error(`Ticket not found with channel_id: ${channelId}`);
    }

    logger.info("Ticket marked as open:", channelId);
  }
}
