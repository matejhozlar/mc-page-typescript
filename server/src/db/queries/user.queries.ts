import type { Pool } from "pg";
import logger from "@/logger";

export class UserQueries {
  constructor(private db: Pool) {}
}
