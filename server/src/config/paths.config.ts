import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_DIST =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "..", "client", "dist")
    : path.join(__dirname, "..", "..", "..", "client", "dist");

export interface PathsConfig {
  clientDist: string;
}

const config = {
  /**
   * Path to React frontend build
   */
  clientDist: CLIENT_DIST,
} satisfies PathsConfig;

export default config;
