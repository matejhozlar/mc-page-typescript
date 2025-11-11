import type { Pool } from "pg";
import type { Admin, AdminCreateParams } from "./admin.types";
import { BaseQueries } from "../base.queries";

type AdminCriteria = { id: number } | { discordId: string };

type AdminUpdate = { discordId: string };

export class AdminQueries extends BaseQueries<
  Admin,
  AdminCriteria,
  AdminUpdate,
  AdminCreateParams
> {
  protected readonly table = "admins";

  protected readonly CRITERIA_COLUMN_MAP = {
    id: "id",
    discordId: "discord_id",
  } as const;

  constructor(db: Pool) {
    super(db);
  }
}
