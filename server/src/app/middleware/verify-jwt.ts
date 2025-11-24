import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import logger from "@/logger";

/**
 * Extended Express Request interface with authenticated user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

/**
 * Extracts the Bearer token from the Authorization header
 *
 * @param authHeader - The Authorization header value
 * @returns The extracted token or null if invalid format
 */
function extractBearerToken(authHeader: string): string | null {
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Express middleware to verify JWT token from the Authorization header
 *
 * Authentication middleware that:
 * - Expects `Authorization: Bearer <token>` format
 * - Verifies the token using `JWT_SECRET`
 * - Attaches the decoded payload to `req.user` if valid
 * - Returns 401 for missing/malformed tokens
 * - Returns 403 for invalid/expired tokens
 *
 * @param req - The incoming HTTP request object
 * @param res - The HTTP response object
 * @param next - Function to pass control to the next middleware
 * @returns Reponse with error or proceeds to the next middleware
 */
export default function verifyJwt(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    logger.debug("Authentication failed. Missing Authorization header");
    return res.status(401).json({
      message: "Missing Authorization header",
    });
  }

  const token = extractBearerToken(authHeader);

  if (!token) {
    logger.debug("Authentication failed: Invalid Authorization format");
    return res.status(401).json({
      error: "Authentication required",
      message: "Invalid Authorization format. Expected: Bearer <token>",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    logger.debug("JWT verification successful");
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.warn("JWT verification failed:", errorMessage);
    return res.status(403).json({
      error: "Authentication failed",
      message: "Invalid or expired token",
    });
  }
}
