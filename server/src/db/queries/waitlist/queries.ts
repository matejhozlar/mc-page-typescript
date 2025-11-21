import type { Pool } from "pg";
import type { Waitlist, WaitlistCreate } from "./types";
import { BaseQueries } from "../base.queries";

type Identifier = { id: number } | { email: string };

type Filters = {
  token: string;
  discordName: string;
  submittedAt: Date;
};

type Update = Filters;

export class WaitlistQueries extends BaseQueries<{
  Entity: Waitlist;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: WaitlistCreate;
}> {
  protected readonly table = "waitlist_emails";

  constructor(db: Pool) {
    super(db);
  }
}
