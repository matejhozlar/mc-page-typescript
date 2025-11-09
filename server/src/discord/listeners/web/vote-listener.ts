import type { Client, Message } from "discord.js";
import { requireProduction } from "@/utils/guard/run-guard";
import logger from "@/logger";
import { voteState } from "./utils/vote-state";

/**
 * Sets up a vote listener to allow users to vote on Minecraft server changes
 * via Discord messages
 *
 * Listeners for vote messages from the Createrington bot in the format:
 * `<username>` 1 (for yes) or `<username>` 2 (for no)
 *
 * Only runs in production environment
 *
 * @param webBot - The Discord client instance
 */
export default function setupVoteListener(webBot: Client): void {
  if (!requireProduction()) return;

  const minecraftChannelId = process.env.DISCORD_MINECRAFT_CHAT_CHANNEL_ID;
  const createringtonBotId = process.env.CLIENT_BOT_ID;

  if (!minecraftChannelId || !createringtonBotId) {
    logger.error("Missing required environment variables for vote listener");
    return;
  }

  webBot.on("messageCreate", async (msg: Message) => {
    if (msg.channelId !== minecraftChannelId) return;

    if (msg.author.id !== createringtonBotId) return;

    const match = msg.content.match(/^`<([^>]+)>`\s*(1|2)$/);
    if (!match || !voteState.active) return;

    const [, username, vote] = match;

    if (voteState.voters.has(username)) return;

    if (vote === "1") {
      voteState.counts.yes++;
    } else if (vote === "2") {
      voteState.counts.no++;
    }

    voteState.voters.add(username);
  });
}
