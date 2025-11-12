import type { Pool } from "pg";
import type { AiMessageLog, AiMessageLogCreate } from "./ai-message-log.types";
import logger from "@/logger";
import { BaseQueries } from "../base.queries";

type AiMessageLogIdentifier = { id: number };

type AiMessageLogFilters =
  | { discordId: string }
  | { message: string }
  | { createdAt: Date };

type AiMessageLogUpdate =
  | { discordId: string }
  | { message: string }
  | { createdAt: Date };

export class AiMessageLogQueries extends BaseQueries<
  AiMessageLog,
  AiMessageLogIdentifier,
  AiMessageLogFilters,
  AiMessageLogUpdate,
  AiMessageLogCreate
> {
  protected readonly table = "ai_message_log";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Retrieves the count of AI messages sent by a specific user to the current date
   *
   * @param discordId - The Discord user ID to search for
   * @returns Promise resolving to the number of messages sent
   * @throws Error if the database query fails or the user does not exist
   */
  async getToday(discordId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM ${this.table}
             WHERE discord_id = $1 AND created_at::date = CURRENT_DATE`,
      [discordId]
    );

    return parseInt(result.rows[0]?.count ?? "0", 10);
  }
}
