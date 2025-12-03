import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

/**
 * Custom Zod refinement for IPv4 validation
 */
const ipv4Schema = z
  .string()
  .min(1, "IP address is required")
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    "Must be a valid IPv4 address"
  );

/**
 * Custom Zod refinement for IPv6 validation
 */
const ipv6Schema = z
  .string()
  .min(1, "IP address is required")
  .regex(
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
    "Must be a valid IPv6 address"
  );

/**
 * Accepts both IPv4 and IPv6
 */
const ipSchema = z.union([ipv4Schema, ipv6Schema]);

/**
 * Zod schema defining structure and validation rules for environment variables
 * // Server
 * @property {number} PORT - Server port number (must be a positive integer, default 5000)
 * @property {string} NODE_ENV - Application environment (development, production, test)
 * // Game servers
 * @property {string} COGS_AND_STEAM_SERVER_IP - IP address of Cogs & Steam game server
 * @property {number} COGS_AND_STEAM_SERVER_PORT - Server port of Cogs & Steam game server
 * @property {number} COGS_AND_STEAM_RCON_PORT - Rcon port for Cogs & steam game server
 * @property {string} COGS_AND_STEAM_RCON_PASSWORD - Rcon password for Cogs & Steam game server
 * // Discord
 * @property {string} DISCORD_GUILD_ID - Discord server/guild ID (must be numeric snowflake)
 * @property {string} DISCORD_MAIN_BOT_TOKEN - Discord bot authentication token
 * @property {string} DISCORD_MAIN_BOT_ID - Discord bot application/client ID (must be numeric snowflake)
 */
const envSchema = z.object({
  // Server
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Game Servers
  COGS_AND_STEAM_SERVER_IP: ipv4Schema,
  COGS_AND_STEAM_SERVER_PORT: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Cogs & Steam server port is required"),
  COGS_AND_STEAM_RCON_PORT: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Cogs & Steam rcon port is required"),
  COGS_AND_STEAM_RCON_PASSWORD: z
    .string()
    .min(1, "Cogs & Steam rcon password is required"),

  // Discord
  DISCORD_GUILD_ID: z
    .string()
    .min(1, "Guild ID is required")
    .regex(/^\d{17,19}$/, "Guild ID must be a valid Discord snowflake"),
  DISCORD_MAIN_BOT_TOKEN: z
    .string()
    .min(1, "Bot token is required")
    .regex(/^[\w\-\.]+$/, "Bot token must be a valid Discord token format"),
  DISCORD_MAIN_BOT_ID: z
    .string()
    .min(1, "Bot ID is required")
    .regex(/^\d{17,19}$/, "Bot ID must be a valid Discord snowflake"),
});

/**
 * Type representing validated environment configuration
 * Automatically inferred from the envSchema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the defined schema
 *
 * This function parses process.env and ensures all required environment variables
 * are present and vallid according to the schema. If validation fails, it logs
 * detailed error messages and exists the process
 *
 * @returns Validated and type-safe environment configuration object
 * @throws Exits process with code 1 if validation fails
 */
function validateEnv(): Env {
  console.log("Validating environment...");
  try {
    const validated = envSchema.parse(process.env);
    console.info("All required environment variables are set and valid");
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      error.issues.forEach((issue) => {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      });
    } else {
      console.error("Unexpected error during environment validation", error);
    }
    process.exit(1);
  }
}

/**
 * Pre-validated environment configuration object
 *
 * This object is created at module load time and provides type-safe access
 * to validated environment variables throughout the application
 */
export const env = validateEnv();

export const envMode = {
  /**
   * True when NODE_ENV is 'development'
   * Used to enable development-specific features and logging
   */
  isDev: env.NODE_ENV === "development",
  /**
   * True when NODE_ENV is 'production'
   * Used to enable production optimizations and disable debug features
   */
  isProd: env.NODE_ENV === "production",
  /**
   * True when NODE_ENV = 'test'
   * Used to enable test-specific configuration and mocking
   */
  isTest: env.NODE_ENV === "test",
} as const;
