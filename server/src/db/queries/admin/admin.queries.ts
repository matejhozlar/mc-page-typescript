import type { Pool } from "pg";
import type { Admin, AdminCreate } from "./admin.types";
import { BaseQueries } from "../base.queries";

type AdminIdentifier = { id: number } | { discordId: number };

type AdminFilters = { createdAt: Date } | { vanished: boolean };

type AdminUpdate = { vanished: boolean };

export class AdminQueries extends BaseQueries<
  Admin,
  AdminIdentifier,
  AdminFilters,
  AdminUpdate,
  AdminCreate
> {
  protected readonly table = "admins";

  constructor(db: Pool) {
    super(db);
  }
}
