import type { Client } from "discord.js";
import { requireProduction } from "@/utils/guard/run-guard";
import config from "@/config";

/**
 * Periodically updates server stat channel names with current member/bot counts
 *
 * Updates voice channel names to display:
 * - Total members (excluding bots)
 * - Total bots
 * - All members combined
 *
 * Only runs in production environment, and caches values to avoid unnecessary API calls
 *
 * @param mainBot - The Discord client instance
 */
export default function startUpdatingServerStats(mainBot: Client): void {
  if (!requireProduction()) return;

  const guildId = process.env.DISCORD_GUILD_ID;
  const membersChannelId = process.env.DISCORD_MEMBERS_COUNTER_CHANNEL_ID;
  const botsChannelId = process.env.DISCORD_BOTS_COUNTER_CHANNEL_ID;
  const allMembersChannelId = process.env.DISCORD_ALL_MEMBERS_CHANNEL_ID;

  if (!guildId || !membersChannelId || !botsChannelId || !allMembersChannelId) {
    logger.error("Missing required environment variables for server stats");
    return;
  }

  let lastMembers: number | null = null;
  let lastBots: number | null = null;
  let lastTotal: number | null = null;

  async function updateStats(): Promise<void> {
    try {
      const guild = await mainBot.guilds.fetch(guildId);
      await guild.members.fetch();

      const members = guild.members.cache.filter((m) => !m.user.bot).size;
      const bots = guild.members.cache.filter((m) => m.user.bot).size;
      const total = members + bots;

      if (members === lastMembers && bots === lastBots && total === lastTotal) {
        return;
      }

      lastMembers = members;
      lastBots = bots;
      lastTotal = total;

      const membersChannel = guild.channels.cache.get(membersChannelId);
      const botsChannel = guild.channels.cache.get(botsChannelId);
      const allMembersChannel = guild.channels.cache.get(allMembersChannelId);

      if (membersChannel?.isVoiceBased()) {
        await membersChannel.setName(`Members: ${members}`);
      }
      if (botsChannel?.isVoiceBased()) {
        await botsChannel.setName(`Bots: ${bots}`);
      }
      if (allMembersChannel?.isVoiceBased()) {
        await allMembersChannel.setName(`All Members: ${total}`);
      }

      logger.info(
        `Server stats updated: ${members} members, ${bots} bots, ${total} total`
      );
    } catch (error) {
      logger.error("Failed to update server stats:", error);
    }
  }

  updateStats();

  const updateInterval = config.discord.listeners.stats.statsUpdateIntervalMs;
  setInterval(updateStats, updateInterval);
}
