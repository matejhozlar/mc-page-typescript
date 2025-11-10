import type { Pool } from "pg";
import type { Ticket, TicketCreateParams } from "@/types/models/ticket.types";
import logger from "@/logger";

export class TicketQueries {
  constructor(private db: Pool) {}

  /**
   * Retrieves the first open (non-deleted) ticket associated with a Discord user
   *
   * @param discordId - The Discord user ID to search for
   * @returns Promise resolving to the user's open ticket if found, null otherwise
   */
  async findOpenByDiscordId(discordId: string): Promise<Ticket | null> {
    const result = await this.db.query<Ticket>(
      `SELECT * FROM tickets WHERE discord_id = $1 AND status != 'deleted' LIMIT 1`,
      [discordId]
    );

    return result.rows[0] || null;
  }

  /**
   * Retrieves a ticket by its associated Discord channel identifier
   *
   * @param channelId - The Discord channel ID to search for
   * @returns Promise resolving to the ticket if found, null otherwise
   */
  async findByChannelId(channelId: string): Promise<Ticket | null> {
    const result = await this.db.query<Ticket>(
      `SELECT * FROM tickets WHERE channel_id = $1 LIMIT 1`,
      [channelId]
    );

    return result.rows[0] || null;
  }

  /**
   * Updates the admin panel message ID reference for a specific ticket
   *
   * @param channelId - The Discord channel Id of the ticket
   * @param adminMessageId - The message ID of the admin panel in Discord
   * @returns Promise resolving when the update is complete
   * @throws Error if the ticket with the specified channel ID is not found
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
   * Atomically increments and retrieves the next sequential ticket number from the counter
   *
   * @returns Promise resolving to the next available ticket number
   * @throws Error if the ticket counter update fails
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
   * Creates and persists a new ticket record in the database
   *
   * @param params - Object containing ticket creation data (ticket_number, discord_id, mc_name, channel_id)
   * @returns Promise resolving when the ticket is created
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
   * Updates a ticket's status to deleted and recors the timestamp
   *
   * @param channelId - The Discord channel ID of the ticket to delete
   * @returns Promise resolving when the status is updated
   * @throws Error if no ticket is found with the specified channel ID
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
   * Updates a ticket's status to open and records the timestamp
   *
   * @param channelId - The Discord channel ID of the ticket to reopen
   * @returns Promise resolving when the status is updated
   * @throws Error if no ticket is found with the specified channel ID
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
