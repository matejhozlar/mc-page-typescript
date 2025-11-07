import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "../../logger";

type MaybePromise = void | Promise<void>;

const ENV = (process.env.NODE_ENV ?? "development").toLowerCase();
export const isProduction = ENV === "production";
export const isDevelopment = !isProduction;

/**
 * Run the provided function only in production.
 * Logs a skip message (with caller path) when not in production.
 */
export async function runInProduction(fn: () => MaybePromise): Promise<void> {
  if (!isProduction) {
    logger.info(
      "🛑 Skipped production-only code from:",
      getCallerRelativePath()
    );
    return;
  }
  await fn();
}

/**
 * Run the provided function only in development.
 * Logs a skip message (with caller path) when in production.
 */
export async function runInDevelopment(fn: () => MaybePromise): Promise<void> {
  if (isProduction) {
    logger.info(
      "🛑 Skipped development-only code from:",
      getCallerRelativePath()
    );
    return;
  }
  await fn();
}

/**
 * Use at the top of modules/listeners that should be completely disabled
 * outside of production. Return early if this returns false.
 *
 * @example
 * if (!requireProduction()) return;
 */
export function requireProduction(): boolean {
  if (!isProduction) {
    logger.info(
      "🛑 Skipped production-only module from:",
      getCallerRelativePath()
    );
    return false;
  }
  return true;
}

/**
 * Best-effort relative caller path for nicer logs.
 * Uses `process.cwd()` as the project root anchor and trims extensions.
 */
function getCallerRelativePath(): string {
  const stack = new Error().stack ?? "";
  const lines = stack.split("\n");
  const callerLine = lines[3] ?? "";

  const match =
    callerLine.match(/\((.*):\d+:\d+\)$/) ||
    callerLine.match(/at (.*):\d+:\d+$/);

  let fullPath = match?.[1];
  if (!fullPath) return "unknown";

  fullPath = fullPath.startsWith("file://")
    ? fileURLToPath(fullPath)
    : decodeURIComponent(fullPath);

  const relativePath = path.relative(process.cwd(), fullPath);
  const parsed = path.parse(relativePath);
  return path.join(parsed.dir, parsed.name).replaceAll("\\", "/");
}
