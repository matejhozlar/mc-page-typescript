import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_DIST =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "..", "client", "dist")
    : path.join(__dirname, "..", "..", "..", "client", "dist");

export interface PathsConfig {
  CLIENT_DIST: string;
}

const config = {
  CLIENT_DIST: CLIENT_DIST,
} satisfies PathsConfig;

export default config;
