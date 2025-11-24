import type { Request, Response, NextFunction } from "express";
import logger from "@/logger";

const allowedIpCogs = process.env.ALLOWED_IP_ADDRESS_COGS_AND_STEAM;
const allowedIpLocal = process.env.ALLOWED_IP_ADDRESS_LOCAL;

/**
 * Normalizes IP address by removing IPv6 prefix and extracting the first IP
 * from comma-separated lists
 *
 * @param rawIp - Raw IP address string
 * @returns Normalized IPv4 address
 */
function normalizeIp(rawIp: string | undefined): string {
  if (!rawIp) return "";

  return rawIp.replace("::ffff:", "").split(",")[0].trim();
}

/**
 * Gets the client's IP address from the request
 * Checks X-Forwarded-For header first (for proxied requests),
 * then falls back to socket address
 *
 * @param req - Express request object
 * @returns Client IP address
 */
function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const rawIp =
    typeof forwardedFor === "string"
      ? forwardedFor
      : forwardedFor?.[0] || req.socket.remoteAddress;

  return normalizeIp(rawIp);
}

/**
 * Express middleware to verify the IP address of incoming requests
 *
 * Security middleware that restricts API access to whitelisted IP addresses
 *
 * @param req - The incoming HTTP request
 * @param res - The HTTP response object
 * @param next - Function to call the middleware
 * @returns 403 Forbidden if IP is not whitelisted, otherwise proceeds to the next middleware
 */
export default function verifyIp(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const clientIp = getClientIp(req);
  const isProd = process.env.NODE_ENV === "production";

  const allowedIps = isProd ? [allowedIpCogs] : [allowedIpCogs, allowedIpLocal];

  const isAllowed = allowedIps.filter(Boolean).includes(clientIp);

  if (isAllowed) {
    logger.debug("Allowed request from IP:", clientIp);
    return next();
  }

  logger.warn("Blocked request for unauthorized IP:", clientIp);
  return res.status(403).json({
    error:
      "Forbidden: Your IP address is not authorized to access this resource",
  });
}
