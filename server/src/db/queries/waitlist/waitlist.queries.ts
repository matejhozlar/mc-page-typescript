import type { Pool } from "pg";
import type { Waitlist, WaitlistCreate } from "./waitlist.types";
import { BaseQueries } from "../base.queries";

type WaitlistIdentifier = { id: number } | { email: string };

type WaitlistFilters =
  | { submittedAt: Date }
  | { token: string }
  | { discordName: string };

type WaitlistUpdate =
  | { submittedAt: Date }
  | { token: string }
  | { discordName: string };

export class WaitlistQueries extends BaseQueries<
  Waitlist,
  WaitlistIdentifier,
  WaitlistFilters,
  WaitlistUpdate,
  WaitlistCreate
> {
  protected readonly table = "waitlist_emails";

  constructor(db: Pool) {
    super(db);
  }
}
