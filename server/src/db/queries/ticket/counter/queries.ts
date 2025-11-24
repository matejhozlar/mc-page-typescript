import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { TicketCounter, TicketCounterCreate, TicketCounterRow } from "./types";

type Identifier = { id: number };

type Filters = {
  lastNumber: number;
};

type Update = {
  lastNumber: number;
};

export class TicketCounterQueries extends BaseQueries<{
  Entity: TicketCounter;
  DbEntity: TicketCounterRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: TicketCounterCreate;
}> {
  protected readonly table = "ticket_counter";

  constructor(db: Pool) {
    super(db);
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
