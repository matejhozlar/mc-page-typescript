import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { validateEnv } from "./config/env/env-validate";
validateEnv();

import http from "node:http";
import { createApp } from "./app";
import db from "./db";
import logger from "@/logger";

const PORT = process.env.PORT;

const app = createApp({ db });

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

function shutDown(code: number = 0) {
  logger.info("Shutting down...");
  httpServer.close(() => {
    logger.info("HTTP Server closed");
    process.exit(code);
  });
}

process.on("SIGINT", () => shutDown(0));
process.on("SIGTERM", () => shutDown(0));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});
