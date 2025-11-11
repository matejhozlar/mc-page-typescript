import type { Pool } from "pg";
import type { Waitlist, WaitlistCreateParams } from "./waitlist.types";
import { BaseQueries } from "../base.queries";

type WaitlistCriteria =
  | { id: number }
  | { email: string }
  | { token: string }
  | { discordName: string };

type WaitlistUpdate =
  | { email: string }
  | { token: string }
  | { discordName: string };

export class WaitlistQueries extends BaseQueries<
  Waitlist,
  WaitlistCriteria,
  WaitlistUpdate,
  WaitlistCreateParams
> {
  protected readonly table = "waitlist_emails";

  protected readonly CRITERIA_COLUMN_MAP = {
    id: "id",
    email: "email",
    token: "token",
    discordName: "discord_name",
    submittedAt: "submitted_at",
  } as const;

  constructor(db: Pool) {
    super(db);
  }
}
