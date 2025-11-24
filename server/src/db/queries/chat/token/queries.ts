import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ChatToken, ChatTokenCreate, ChatTokenRow } from "./types";
import logger from "@/logger";

type Identifier = { token: string } | { discordId: string };

type Filters = {
  discordName: string;
  expiresAt: Date;
};

type Update = {
  token: string;
  discordId: string;
  discordName: string;
  expiresAt: Date;
};

export class ChatTokenQueries extends BaseQueries<{
  Entity: ChatToken;
  DbEntity: ChatTokenRow;
  Identifier: Identifier;
  Filters: Filters;
  Create: ChatTokenCreate;
  Update: Update;
}> {
  protected readonly table = "chat_tokens";

  constructor(db: Pool) {
    super(db);
  }

  /**
   * Validates a chat token for a specific user
   *
   * @param token - Token to validate
   * @returns Promise resolving to a Discord name for the token
   */
  async validate(token: string): Promise<string> {
    try {
      const result = await this.db.query(
        `SELECT discord_name FROM ${this.table} WHERE token = $1 AND expires_at > NOW()`,
        [token]
      );
      return result.rows[0].discord_name;
    } catch (error) {
      logger.error(`Failed to validate ${this.table}:`, error);
      throw error;
    }
  }
}
