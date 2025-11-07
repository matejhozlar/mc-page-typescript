import { Router } from "express";
import { asyncHandler } from "@/app/middleware/async-handler";
import { createTestController } from "./test-api.controller";

/**
 * Creates test route handlers
 */
export function createTestRoutes(): Router {
  const router = Router();
  const controller = createTestController();

  router.get("/test", asyncHandler(controller.getTest));
  router.get("/db-test", asyncHandler(controller.getDbTest));

  return router;
}
