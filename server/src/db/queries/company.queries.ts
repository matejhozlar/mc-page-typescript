import type { Pool } from "pg";
import logger from "@/logger";

export class CompanyQueries {
  constructor(private db: Pool) {}
}
