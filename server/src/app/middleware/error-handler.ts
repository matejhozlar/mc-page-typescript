import type { Request, Response, NextFunction } from "express";
import logger from "@/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error";

  res.status(500).json({
    status: "error",
    message,
  });
};
