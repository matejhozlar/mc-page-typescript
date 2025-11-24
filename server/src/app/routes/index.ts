import { Router } from "express";
import { AppDependencies } from "@/types/app/routes/dependencies";

/**
 * Registers all application routes with their specific dependencies
 * Each route receives only the dependencies it needs
 */
export function createRoutes(deps: AppDependencies): Router {
  const router = Router();

  return router;
}
