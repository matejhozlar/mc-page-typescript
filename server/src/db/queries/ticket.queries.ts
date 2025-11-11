import type { Pool } from "pg";
import type { Ticket } from "@/types/models/ticket.types";
import logger from "@/logger";
import { createNotFoundError } from "@/db/utils/query-helpers";

type TicketCriteria =
  | { id: number }
  | { ticketNumber: number }
  | { discordId: string }
  | { mcName: string }
  | { channelId: string }
  | { adminMessageId: string };

type TicketUpdate =
  | { ticketNumber: number }
  | { discordId: string }
  | { mcName: string }
  | { channelId: string }
  | { adminMessageId: string };

type TicketCriteriaValue = TicketCriteria[keyof TicketCriteria];

export const TicketStatus = {
  OPEN: "open",
  DELETED: "deleted",
} as const;

export type Status = (typeof TicketStatus)[keyof typeof TicketStatus];

export class TicketQueries {
  private readonly CRITERIA_COLUMN_MAP = {
    id: "id",
    ticketNumber: "ticket_number",
    discordId: "discord_id",
    mcName: "mc_name",
    channelId: "channel_id",
    adminMessageId: "admin_message_id",
  } as const;

  constructor(private db: Pool) {}

  private getCriteriaMapping(criteria: TicketCriteria): {
    column: string;
    value: TicketCriteriaValue;
  } {
    const key = Object.keys(
      criteria
    )[0] as keyof typeof this.CRITERIA_COLUMN_MAP;
    const column = this.CRITERIA_COLUMN_MAP[key];

    if (!column) {
      throw new Error("Invalid search criteria");
    }

    return {
      column,
      value: criteria[key as keyof TicketCriteria] as TicketCriteriaValue,
    };
  }

  private getUpdateMapping(updates: TicketUpdate) {
    return Object.entries(updates).map(([key, value]) => ({
      column:
        this.CRITERIA_COLUMN_MAP[key as keyof typeof this.CRITERIA_COLUMN_MAP],
      value,
    }));
  }

  /**
   * Finds a ticket by various criteria
   * Returns null if not found
   *
   * @param criteria - Object with id, ticketNumber, discordId, mcName, channelId, or adminMessageId
   * @param status - Status of the ticket (open | deleted)
   * @returns Promise resolving to the Ticket or null
   */
  async find(criteria: TicketCriteria, status: Status): Promise<Ticket | null> {
    const { column, value } = this.getCriteriaMapping(criteria);
    const query = `SELECT * FROM tickets WHERE ${column} = $1 AND status = $2 LIMIT 1`;

    try {
      const result = await this.db.query<Ticket>(query, [value, status]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find ticket:", error);
      throw error;
    }
  }

  /**
   * Retrieves a ticket by various criteria
   * Throws an error if not found
   *
   * @param criteria - Object with id, ticketNumber, discordId, mcName, channelId, or adminMessageId
   * @param status - Status of the ticket (open | deleted)
   * @returns Promise resolving to the Ticket
   * @throws Error if ticket is not found
   */
  async get(criteria: TicketCriteria, status: Status): Promise<Ticket> {
    const ticket = await this.find(criteria, status);

    if (!ticket) {
      throw createNotFoundError("Ticket", criteria);
    }

    return ticket;
  }

  /**
   * Check if a ticket exists
   *
   * @param criteria - Object with id, ticketNumber, discordId, mcName, channelId, or adminMessageId
   * @param status - Status of the ticket (open | deleted)
   * @returns Promise resolving to true if ticket exists, false otherwise
   */
  async exists(criteria: TicketCriteria, status: Status): Promise<boolean> {
    const { column, value } = this.getCriteriaMapping(criteria);
    const query = `SELECT EXISTS(SELECT 1 FROM tickets WHERE ${column} = $1 AND status = $2)`;

    try {
      const result = await this.db.query<{ exists: boolean }>(query, [
        value,
        status,
      ]);
      return Boolean(result.rows[0].exists);
    } catch (error) {
      logger.error("Failed to check ticket existence:", error);
      throw error;
    }
  }

  /**
   * Updates a ticket by various criteria
   *
   * @param criteria - Object with id, ticketNumber, discordId, mcName, channelId, or adminMessageId
   * @param updates - Object with ticketNumber, discordId, mcName, channelId, or adminMessageId
   * @returns Promise resolving when the update is complete
   * @throws Error if no ticket entry is found with the specified criteria or update fails
   */
  async update(criteria: TicketCriteria, updates: TicketUpdate): Promise<void> {
    const { column, value } = this.getCriteriaMapping(criteria);
    const updateMappings = this.getUpdateMapping(updates);

    const setClauses = updateMappings.map(
      (mapping, index) => `${mapping.column} = $${index + 2}`
    );

    const query = `
      UPDATE tickets
      SET ${setClauses.join(", ")}
      WHERE ${column} = $1`;

    const params = [value, ...updateMappings.map((m) => m.value)];

    try {
      const result = await this.db.query(query, params);

      if (result.rowCount === 0) {
        throw createNotFoundError("Ticket", criteria);
      }
    } catch (error) {
      logger.error("Failed to update ticket:", error);
      throw error;
    }
  }
}
