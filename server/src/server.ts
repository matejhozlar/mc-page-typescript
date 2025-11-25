import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { validateEnv } from "./config/env/env-validate";
validateEnv();

import http from "node:http";
import { createApp } from "./app";
import db from "./db";
import loggerInstance from "./logger";
import { initIO } from "./socket/io";
import webBot from "./discord/bots/webBot";
import { shutdownBot } from "./discord/utils/shut-down";

global.logger = loggerInstance;

const PORT = process.env.PORT;

const app = createApp({ db });

const httpServer = http.createServer(app);

const io = initIO(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  logger.info("Gracefully shutting down...");

  try {
    await shutdownBot(webBot, {
      notify: true,
      name: "WebBot",
      message: "🔴 WebBot is going offline",
    });

    io.close();

    await db.end();

    httpServer.close(() => {
      logger.info("Server closed. Exiting...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});
