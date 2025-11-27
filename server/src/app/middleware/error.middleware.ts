import { Request, Response, NextFunction } from "express";
import {
  DatabaseError,
  NotFoundError,
  ConstraintViolationError,
  QueryError,
} from "@/db/utils/errors";
import config from "@/config";

/**
 * Global error handling middleware
 * Production: Proper status codes with generic messages
 * Development: Full error details
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Error occurred:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.session?.discordId,
  });

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: "Resource not found",
      ...(config.app.isDev && {
        message: error.message,
        entityName: error.entityName,
        criteria: error.criteria,
      }),
    });
  }

  if (error instanceof ConstraintViolationError) {
    return res.status(409).json({
      error: "Conflict",
      message: config.app.isDev
        ? error.message
        : "The provided data is invalid",
    });
  }

  if (!config.app.isDev) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  if (error instanceof QueryError) {
    return res.status(500).json({
      error: "Database query failed",
      message: error.message,
      query: error.query,
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      error: "Database error",
      message: error.message,
      cause: error.cause,
    });
  }

  res.status(500).json({
    error: error.name || "Error",
    message: error.message,
    stack: error.stack,
  });
}

/**
 * Async handler wrapper to catch promise rejections
 * Passes errors to the error handling middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
