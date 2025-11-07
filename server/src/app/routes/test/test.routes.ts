import { Router } from "express";
import type { AppDependencies } from "@/types/app/routes/dependencies";
import { asyncHandler } from "@/app/middleware/async-handler";
import { createTestController } from "./test.controller";

export function createTestRoutes(deps: AppDependencies): Router {
  const router = Router();
  const controller = createTestController(deps);

  router.get("/test", asyncHandler(controller.getTest));
  router.get("/db-test", asyncHandler(controller.getDbTest));

  return router;
}
