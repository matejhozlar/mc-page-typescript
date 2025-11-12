import type { Pool } from "pg";
import type { ChatToken, ChatTokenCreate } from "./chat-token.types";
import { BaseQueries } from "../base.queries";

type ChatTokenIdentifier = { token: string } | { discordId: string };

type ChatTokenFilters = { discordName: string } | { expiresAt: Date };

type ChatTokenUpdate = { discordName: string } | { expiresAt: Date };

export class ChatTokenQueries extends BaseQueries<
  ChatToken,
  ChatTokenIdentifier,
  ChatTokenFilters,
  ChatTokenUpdate,
  ChatTokenCreate
> {
  protected readonly table = "chat_tokens";

  constructor(db: Pool) {
    super(db);
  }
}
