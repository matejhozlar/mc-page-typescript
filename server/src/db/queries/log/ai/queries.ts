import type { Pool } from "pg";
import type { LogAi, LogAiCreate, LogAiRow } from "./types";
import { BaseQueries } from "../../base.queries";

type Identifier = { id: number };

type Filters = {
  discordId: string;
  message: string;
  createdAt: Date;
};

export class LogAiQueries extends BaseQueries<{
  Entity: LogAi;
  DbEntity: LogAiRow;
  Identifier: Identifier;
  Filters: Filters;
  Create: LogAiCreate;
}> {
  protected readonly table = "ai_logs";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves the count of AI messages sent by a specific user to the current date
   *
   * @param discordId - The Discord user ID to count for
   * @returns Promise resolving to the number of messages sent
   * @throws Error if the dabatase query fails or the user does not exist
   */
  async countToday(discordId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM ${this.table}
        WHERE discord_id = $1 and created_at::date = CURRENT_DATE`,
      [discordId]
    );

    return parseInt(result.rows[0]?.count ?? "0", 10);
  }
}
