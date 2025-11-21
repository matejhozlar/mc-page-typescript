import type { Pool } from "pg";
import type { Ticket, TicketCreate } from "./types";
import logger from "@/logger";
import { createNotFoundError } from "@/db/utils/query-helpers";
import { BaseQueries } from "../base.queries";

type Identifier =
  | { id: number }
  | { ticketNumber: number }
  | { channelId: string }
  | { adminMessageId: string };

type Filters = {
  discordId: string;
  mcName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type Update = {
  ticketNumber: number;
  channelId: string;
  adminMessageId: string;
  discordId: string;
  mcName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export class TicketQueries extends BaseQueries<{
  Entity: Ticket;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: TicketCreate;
}> {
  protected readonly table = "tickets";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Updates a ticket's status to deleted and records the timestamp
   *
   * @param identifier - Object with id, ticketNumber, channelId, or adminMessageId
   * @returns Promise resolving when the status is updated
   * @throws Error if no ticket is found with the specified identifier
   */
  async close(identifier: Identifier): Promise<void> {
    const { whereClause, values } = this.getColumnMapping(identifier);
    const query = `UPDATE ${this.table} SET status = 'deleted', updated_at = NOW() WHERE ${whereClause}`;

    try {
      const result = await this.db.query(query, values);

      if (result.rowCount === 0) {
        throw createNotFoundError(this.table, identifier);
      }

      logger.info("Ticket marked as deleted:", values);
    } catch (error) {
      logger.error(`Failed to close ${this.table}:`, error);
      throw error;
    }
  }

  /**
   * Updates a ticket's status to open and records timestamp
   *
   * @param identifier - Object with id, ticketNumber, channelId, or adminMessageId
   * @returns Promise resolving when the status is updated
   * @throws Error if no ticket is found with the specified identifier
   */
  async open(identifier: Identifier): Promise<void> {
    const { whereClause, values } = this.getColumnMapping(identifier);
    const query = `UPDATE ${this.table} SET status = 'open', updated_at = NOW() WHERE ${whereClause}`;

    try {
      const result = await this.db.query(query, values);

      if (result.rowCount === 0) {
        throw createNotFoundError(this.table, identifier);
      }

      logger.info("Opened a ticket:", values);
    } catch (error) {
      logger.error(`Failed to open ${this.table}:`, error);
      throw error;
    }
  }

  /**
   * Atomically increments and retrieves the next sequential ticket number from the counter
   *
   * @returns Promise resolving to the next available ticket number
   * @throws Error if the ticket counter update fails
   */
  async next(): Promise<number> {
    const result = await this.db.query<{ last_number: number }>(
      `UPDATE ticket_counter
       SET last_number = last_number + 1
       WHERE id = 1
       RETURNING last_number`
    );

    if (result.rowCount === 0) {
      throw new Error("Failed to get next ticket number");
    }

    return result.rows[0].last_number;
  }
}
