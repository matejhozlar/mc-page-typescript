import type { Pool } from "pg";
import type { Admin, AdminCreate } from "./types";
import { BaseQueries } from "../base.queries";

type Identifier = { id: number } | { discordId: number };

type Filters = {
  vanished: boolean;
  createdAt: Date;
};

type Update = { vanished: boolean };

export class AdminQueries extends BaseQueries<{
  Entity: Admin;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: AdminCreate;
}> {
  protected readonly table = "admins";

  constructor(db: Pool) {
    super(db);
  }
}
