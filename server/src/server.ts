import "./bootstrap";
import http from "node:http";
import { createApp } from "./app";
import { MinecraftStatusManager } from "./services/minecraft-status";
import mainBot from "./discord/bots/main";

const PORT = parseInt(process.env.PORT);

async function shutdown(httpServer: http.Server): Promise<void> {
  logger.info("Shutting down...");

  try {
    httpServer.close(() => {
      logger.info("Server closed. Exiting...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

function setupProcessHandlers(httpServer: http.Server): void {
  process.on("SIGINT", () => shutdown(httpServer));
  process.on("SIGTERM", () => shutdown(httpServer));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection:", reason);
    shutdown(httpServer);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    shutdown(httpServer);
  });
}

function start(): void {
  const app = createApp();
  const httpServer = http.createServer(app);

  setupProcessHandlers(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });
}

start();

logger.info(mainBot);

const statusManger = MinecraftStatusManager.getInstance(
  process.env.COGS_AND_STEAM_SERVER_IP,
  parseInt(process.env.COGS_AND_STEAM_SERVER_PORT),
  parseInt(process.env.COGS_AND_STEAM_QUERY_PORT)
);
statusManger.start();
