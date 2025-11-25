import { Router } from "express";
import { AppDependencies } from "@/types/app/routes/dependencies";
import { createOAuthRoutes } from "./oauth/oauth.routes";

/**
 * Registers all application routes with their specific dependencies
 * Each route receives only the dependencies it needs
 */
export function createRoutes(deps: AppDependencies): Router {
  const router = Router();

  router.use("/api", createOAuthRoutes());

  return router;
}
