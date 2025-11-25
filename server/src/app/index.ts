import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { runInDevelopment } from "@/utils/guard/run-guard";
import config from "@/config";
import { AppDependencies } from "@/types/app/routes/dependencies";

const limiter = rateLimit({
  windowMs: config.api.rateLimit.windowMs,
  max: config.api.rateLimit.max,
});

/**
 * Initializes and configures an Express application
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use("/api", limiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(express.static(config.paths.clientDist));

  runInDevelopment(() => {
    app.use(cors({ origin: true, credentials: true }));
  });

  return app;
}
