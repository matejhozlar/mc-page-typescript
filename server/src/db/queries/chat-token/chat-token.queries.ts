import type { Pool } from "pg";
import type { ChatToken, ChatTokenCreateParams } from "./chat-token.types";
import { BaseQueries } from "../base.queries";

type ChatTokenCriteria =
  | { token: string }
  | { discordId: string }
  | { discordName: string };

type ChatTokenUpdate = { discordId: string } | { discordName: string };

export class ChatTokenQueries extends BaseQueries<
  ChatToken,
  ChatTokenCriteria,
  ChatTokenUpdate,
  ChatTokenCreateParams
> {
  protected readonly table = "chat_tokens";

  protected readonly CRITERIA_COLUMN_MAP = {
    token: "token",
    discordId: "discord_id",
    discordName: "discord_name",
    expiresAt: "expires_at",
  } as const;

  constructor(db: Pool) {
    super(db);
  }
}
