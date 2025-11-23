import pg from "pg";
import logger from "@/logger";
import config from "@/config";
import {
  AdminQueries,
  ChatQueries,
  CompanyQueries,
  CryptoQueries,
  CurrencyQueries,
  DailyQueries,
  ItemQueries,
  JobQueries,
  LeaderboardQueries,
  LogQueries,
  LotteryQueries,
  ShopQueries,
  SnapshotQueries,
  TicketQueries,
  UserQueries,
  WaitlistQueries,
} from "./queries";

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

export const admins = new AdminQueries(db);
export const chat = new ChatQueries(db);
export const companies = new CompanyQueries(db);
export const crypto = new CryptoQueries(db);
export const currency = new CurrencyQueries(db);
export const daily = new DailyQueries(db);
export const items = new ItemQueries(db);
export const jobs = new JobQueries(db);
export const leaderboards = new LeaderboardQueries(db);
export const logs = new LogQueries(db);
export const lotteries = new LotteryQueries(db);
export const shops = new ShopQueries(db);
export const snapshots = new SnapshotQueries(db);
export const tickets = new TicketQueries(db);
export const users = new UserQueries(db);
export const waitlists = new WaitlistQueries(db);

export default db;
