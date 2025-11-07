import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Client } from "discord.js";
import type { Pool } from "pg";

/**
 * Dependency context passed to event listeners
 */
export interface ListenerDependencies {
  db: Pool;
  [key: string]: any;
}

/**
 * Even listener module structure
 */
export interface ListenerModule {
  default: (client: Client, deps: ListenerDependencies) => void | Promise<void>;
}

/**
 * Dynamically loads and registers client event listeners from discord/listeners/client folder
 *
 * @param client - The Discord client instance to register listeners to
 * @param deps - Dependencies to pass to each listener functions
 */
export async function registerClientListeners(
  client: Client,
  deps: ListenerDependencies
): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const listenersDir = path.join(__dirname, "..", "..", "listeners", "client");
  const files = fs.readdirSync(listenersDir).filter((f) => f.endsWith(".ts"));

  for (const file of files) {
    const fullPath = path.join(listenersDir, file);
    const module = (await import(
      pathToFileURL(fullPath).href
    )) as ListenerModule;

    if (typeof module.default === "function") {
      await module.default(client, deps);
    }
  }
}
