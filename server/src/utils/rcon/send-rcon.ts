import { Rcon } from "rcon-client";
import type { RconConfig, RconCommandResult } from "./types";

function getRconConfig(): RconConfig {
  const host = process.env.COGS_AND_STEAM_SERVER_IP;
  const port = parseInt(process.env.COGS_AND_STEAM_RCON_PORT);
  const password = process.env.COGS_AND_STEAM_RCON_PASSWORD;

  if (!host || !port || !password) {
    throw new Error("Missing required RCON environment variables");
  }

  return { host, port, password };
}

/**
 * Sends a command to a Minecraft server using RCON with detailed result
 *
 * @param command - The command to send to the server
 * @retunrs Detailed command result
 */
export async function sendRconCommandDetailed(
  command: string
): Promise<RconCommandResult> {
  let rcon: Rcon | null = null;
  const timestamp = new Date();

  try {
    const config = getRconConfig();
    rcon = await Rcon.connect(config);
    const response = await rcon.send(command);

    logger.info("RCON command sent:", command);

    return {
      command,
      response,
      timestamp,
      success: true,
    };
  } catch (error) {
    logger.error("RCON command failed:", error);

    return {
      command,
      response: error instanceof Error ? error.message : "Unknown error",
      timestamp,
      success: false,
    };
  } finally {
    if (rcon) {
      try {
        await rcon.end();
      } catch (error) {
        logger.warn("Failed to close RCON connection:", error);
      }
    }
  }
}

/**
 * Sends a command to a Minecraft server using RCON (simple version)
 *
 * @param command - THe command to send to the server
 * @returns The server's response to the command
 * @throws Error if the RCON connection or command fails
 */
export async function sendRconCommand(command: string): Promise<string> {
  const result = await sendRconCommandDetailed(command);

  if (!result.success) {
    throw new Error("Failed to send RCON command:", Error(result.response));
  }

  return result.response;
}
