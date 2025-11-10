import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import logger from "@/logger";
import { isSendableChannel } from "@/discord/utils/channel-guard";

const { CLIENT_BOT_TOKEN, DISCORD_CRYPTO_CHANNEL_ID } = process.env;

interface CrashNotificationToken {
  name: string;
  symbol: string;
  description: string | null;
  price_per_unit: string;
  total_supply: string;
}

/**
 * Sends a crash notification embed for a token to a Discord channel
 *
 * @param token - The crashed token
 */
export async function sendCrashNotification(
  token: CrashNotificationToken
): Promise<void> {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  return new Promise((resolve, reject) => {
    client.once("clientReady", async () => {
      try {
        const channel = await client.channels.fetch(DISCORD_CRYPTO_CHANNEL_ID);

        if (!channel || !isSendableChannel(channel)) {
          throw new Error(
            `Channel ${DISCORD_CRYPTO_CHANNEL_ID} not text-based or found`
          );
        }

        const embed = new EmbedBuilder()
          .setTitle(`💀 Token Crashed: ${token.name} (${token.symbol})`)
          .setColor(0xff0000)
          .setDescription(token.description || "No description provided.")
          .addFields(
            {
              name: "💵 Last Known Price",
              value: `$${parseFloat(token.price_per_unit).toFixed(4)}`,
              inline: true,
            },
            {
              name: "📦 Total Supply",
              value: Math.round(
                parseFloat(token.total_supply)
              ).toLocaleString(),
              inline: true,
            },
            { name: "🧬 Type", value: "Memecoin", inline: true }
          )
          .setFooter({ text: "Createrington Market" })
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        logger.info(`Crash alert sent for ${token.name} (${token.symbol})`);

        resolve();
      } catch (error) {
        logger.error("Failed to send crash alert:", error);
        reject(error);
      } finally {
        client.destroy();
      }
    });

    client.login(CLIENT_BOT_TOKEN).catch((error) => {
      logger.error(
        "Failed to login Discord client for crash notification:",
        error
      );
      reject(error);
    });
  });
}
