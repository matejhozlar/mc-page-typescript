import pg from "pg";
import logger from "@/logger";
import config from "@/config";
import { UserQueries, WaitlistQueries, AdminQueries } from "./queries";

/**
 * PostgreSQL database pool instance using environment variables
 *
 * Environemnt variables used:
 * @env DB_USER - The PostgreSQL username
 * @env DB_HOST - The PostgreSQL host
 * @env DB_DATABASE - The name of the database
 * @env DB_PASSWORD - THe database user's password
 * @env DB_PORT - THe port PostgreSQL is running on
 */
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,
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

export const userQueries = new UserQueries(db);
export const waitlistQueries = new WaitlistQueries(db);
export const adminQueries = new AdminQueries(db);

export default db;
