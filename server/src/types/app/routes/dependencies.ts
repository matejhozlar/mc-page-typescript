import type { Pool } from "pg";

export interface AppDependencies {
  db: Pool;
}
