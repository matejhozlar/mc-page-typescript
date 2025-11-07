import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Client } from "discord.js";

/**
 * Dependency context passed to web event listeners
 */
export interface WebListenerDependencies {
  [key: string]: any;
}

/**
 * Web even listener module structure
 */
export interface WebListenerModule {
  default: (
    client: Client,
    deps: WebListenerDependencies
  ) => void | Promise<void>;
}

/**
 * Dynamically loads and registers all web event listeners from discord/listeners/web folder
 *
 * @param {Client} client - The Discord client instance to register listeners on
 * @param {WebListenerDependencies} deps - Dependencies to pass to each listener
 */
export async function registerWebListeners(
  client: Client,
  deps: WebListenerDependencies = {}
): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const listenersDir = path.join(__dirname, "..", "..", "listeners", "web");
  const files = fs.readdirSync(listenersDir).filter((f) => f.endsWith(".ts"));

  for (const file of files) {
    const fullPath = path.join(listenersDir, file);
    const module = (await import(
      pathToFileURL(fullPath).href
    )) as WebListenerDependencies;

    if (typeof module.default === "function") {
      await module.default(client, deps);
    }
  }
}
