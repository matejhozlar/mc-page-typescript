import Router, { type Request, Response } from "express";
import logger from "@/logger";

const router = Router();

interface TestRouteResponse {
  timestamp: string;
  msg: string;
}

/**
 * Test route
 */
router.get("/test", async (req: Request, res: Response) => {
  try {
    const responseData: TestRouteResponse = {
      timestamp: new Date().toISOString(),
      msg: "Hello from the test route",
    };

    return res.json(responseData);
  } catch (error) {
    logger.error("Error in test route:", error);
    res.status(500).json({ error: error });
  }
});

export default router;
