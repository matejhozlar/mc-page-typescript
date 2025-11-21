import { Pool } from "pg";
import { BaseQueries } from "../../base.queries";
import { ChatToken, ChatTokenCreate } from "./types";

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
  Identifier: Identifier;
  Filters: Filters;
  Create: ChatTokenCreate;
  Update: Update;
}> {
  protected readonly table = "chat_tokens";

  constructor(db: Pool) {
    super(db);
  }
}
