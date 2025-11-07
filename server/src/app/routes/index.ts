import { Router } from "express";
import { AppDependencies } from "@/types/app/routes/dependencies";
import { createTestRoutes } from "./test/test-api.routes";
import { runInDevelopment } from "@/utils/guard/run-guard";

/**
 * Registers all application routes with their specific dependencies
 * Each route receives only the dependencies it needs
 */
export function createRoutes(deps: AppDependencies): Router {
  const router = Router();

  runInDevelopment(() => {
    router.use("/api", createTestRoutes());
  });

  return router;
}
