import pg from "pg";
import logger from "@/logger";
import config from "@/config";
import { AdminQueries, WaitlistQueries, CompanyQueries } from "./queries";

/**
 * PostgreSQL database pool instance using environment variables.
 *
 * Environment Variables Used:
 * @env {string} DB_USER - The PostgreSQL username
 * @env {string} DB_HOST - The PostgreSQL host (e.g. localhost or remote)
 * @env {string} DB_DATABASE - The name of the database
 * @env {string} DB_PASSWORD - The database user's password
 * @env {string|number} DB_PORT - The port PostgreSQL is running on
 *
 * Connection Options:
 * - idleTimeoutMillis: 30000 (30 seconds)
 * - connectionTimeoutMillis: 10000 (10 seconds)
 */
const { IDLE_TIMEOUT_MS, CONNECTION_TIMEOUT_MS } = config.Database;

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
});

(async () => {
  try {
    await db.query("SELECT 1");
    logger.info("Connected to PostgreSQL database");
  } catch (error) {
    logger.error("Failed to connect to DB:", error);
    process.exit(1);
  }
})();

export const waitlistQueries = new WaitlistQueries(db);
export const adminQueries = new AdminQueries(db);
export const companyQueries = new CompanyQueries(db);

export default db;
