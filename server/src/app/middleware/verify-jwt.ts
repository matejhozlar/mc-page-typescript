import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, VerifyErrors } from "jsonwebtoken";
import logger from "@/logger";

/**
 * JWT payload structure decoded from tokens
 */
export interface JWTUserPayload extends JwtPayload {
  userId?: string;
  discordId?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

enum JWTErrorType {
  MISSING_HEADER = "MISSING_HEADER",
  INVALID_FORMAT = "INVALID FORMAT",
  INVALID_TOKEN = "INVALID TOKEN",
  EXPIRED_TOKEN = "EXPIRED TOKEN",
}

interface JWTError {
  type: JWTErrorType;
  message: string;
  statusCode: number;
}

/**
 * Extracts Bearer token from Authorization header
 */
function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Determines the appropriate error response based on JWT verification error
 */
function getJwtError(error: unknown): JWTError {
  if (error instanceof jwt.TokenExpiredError) {
    return {
      type: JWTErrorType.EXPIRED_TOKEN,
      message: "Token has expired",
      statusCode: 401,
    };
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return {
      type: JWTErrorType.INVALID_TOKEN,
      message: "Invalid token",
      statusCode: 403,
    };
  }

  return {
    type: JWTErrorType.INVALID_TOKEN,
    message: "Token verification failed",
    statusCode: 403,
  };
}

/**
 * Express middleware to verify JWT tokens from the Authorization header.
 *
 * - Expects `Authorization: Bearer <token>` format
 * - Verifies the token using `JWT_SECRET` environment variable
 * - Attaches the decoded payload to `req.user` if valid
 * - Returns appropriate error responses for various failure scenarios
 */
const verifyJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.debug("JWT verification failed: Missing Authorization header");
    res.status(401).json({
      error: "Missing authorization header",
      type: JWTErrorType.MISSING_HEADER,
    });
    return;
  }

  const token = extractBearerToken(authHeader);

  if (!token) {
    logger.debug("JWT verification failed: Invalid Authorization format");
    res.status(401).json({
      error: "Invalid Authorization format",
      type: JWTErrorType.INVALID_FORMAT,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTUserPayload;

    req.user = decoded;
    logger.debug("JWT verified successfully", { userId: decoded.userId });
    next();
  } catch (error) {
    const jwtError = getJwtError(error);
    logger.warn("JWT verification failed:", {
      type: jwtError.type,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(jwtError.statusCode).json({
      error: jwtError.message,
      type: jwtError.type,
    });
  }
};

export default verifyJWT;
