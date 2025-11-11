import pg from "pg";
import logger from "@/logger";
import config from "@/config";
import {
  UserQueries,
  WaitlistQueries,
  AdminQueries,
  TicketQueries,
  AiMessageLogQueries,
  ChatTokenQueries,
  TokenPriceHistoryQueries,
  CryptoTokenQueries,
  TokenPriceAlertQueries,
  UserTokenQueries,
  UserPortfolioQueries,
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

export const users = new UserQueries(db);
export const waitlists = new WaitlistQueries(db);
export const admins = new AdminQueries(db);
export const tickets = new TicketQueries(db);
export const aiMessageLogQueries = new AiMessageLogQueries(db);
export const chatTokenQueries = new ChatTokenQueries(db);
export const tokenPriceHistoryQueries = new TokenPriceHistoryQueries(db);
export const cryptoTokenQueries = new CryptoTokenQueries(db);
export const tokenPriceAlertQueries = new TokenPriceAlertQueries(db);
export const userTokenQueries = new UserTokenQueries(db);
export const userPortfolioQueries = new UserPortfolioQueries(db);

export default db;
