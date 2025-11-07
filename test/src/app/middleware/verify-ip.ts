import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
  raw,
} from "express";
import logger from "@/logger";
import { cli } from "winston/lib/winston/config";

interface IpConfig {
  production: string[];
  development: string[];
}

const ALLOWED_IPS: IpConfig = {
  production: [
    process.env.ALLOWED_IP_ADDRESS_COGS_AND_STEAM,
    process.env.ALLOWED_IP_ADDRESS_TECHNICA,
  ],
  development: [
    process.env.ALLOWED_IP_ADDRESS_COGS_AND_STEAM,
    process.env.ALLOWED_IP_ADDRESS_TECHNICA,
    process.env.ALLOWED_IP_ADDRESS_LOCAL,
  ],
};

/**
 * Extracts and normalizes the client's IP address from the request.
 *
 * Handles:
 * - X-Forwarded-For header (proxy/load balancer)
 * - IPv6-mapped IPv4 addresses (::ffff:)
 * - Multiple IPs in X-Forwarded-For (takes first)
 */
function extractClientIp(req: Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  const rawIp =
    typeof xForwardedFor === "string"
      ? xForwardedFor
      : Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : req.socket.remoteAddress || "";

  return rawIp.replace("::ffff:", "").split(",")[0].trim();
}

/**
 * Gets the list of allowed IPs based on the current environment.
 */
function getAllowedIps(): string[] {
  const isProd = process.env.NODE_ENV === "production";
  return isProd ? ALLOWED_IPS.production : ALLOWED_IPS.development;
}

/**
 * Express middleware to verify the IP address of incoming requests.
 *
 * - In production: allows only production IPs
 * - In development: allows production IPs + local development IP
 *
 * Returns 403 Forbidden if IP is not in the allowlist.
 */
const verifyIP: RequestHandler = (req, res, next) => {
  const clientIp = extractClientIp(req);
  const allowedIps = getAllowedIps();

  if (allowedIps.includes(clientIp)) {
    logger.debug("Allowed request for IP:", clientIp);
    return next();
  }

  logger.warn("Blocked request from unauthorized IP:", clientIp);

  res.status(403).json({
    error: "Forbidden: Your IP is not allowed.",
    ...(process.env.NODE_ENV !== "production" && {
      clientIp,
      allowedIps,
    }),
  });
};

export default verifyIP;
