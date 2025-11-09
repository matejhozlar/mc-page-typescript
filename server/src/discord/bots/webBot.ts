import { Client, GatewayIntentBits } from "discord.js";
import logger from "@/logger";
import setRotatingStatuses from "@/discord/handlers/web/set-rotating-statuses";
import rotatingStatuses from "@/discord/utils/rotating-statuses";
import { registerWebListeners } from "@/discord/loader/web/listener-loader";
import { getIO } from "@/socket/io";
import { sendBotNotification } from "@/discord/notifiers/send-bot-notification";

/**
 * Discord bot instance for handling web-related interactions
 */
const webBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

webBot.once("clientReady", async () => {
  if (!webBot.user) {
    logger.error("WebBot user is not initialized");
    return;
  }

  logger.info("WebBot logged in as", webBot.user.tag);

  setRotatingStatuses(webBot, rotatingStatuses);

  await sendBotNotification(webBot, "🟢 WebBot is now online.");

  try {
    const io = getIO();
    await registerWebListeners(webBot, { io });
  } catch (error) {
    logger.error("Error during WebBot setup:", error);
  }
});

webBot.login(process.env.WEB_BOT_TOKEN).catch((error) => {
  logger.error("Failed to login WebBot:", error);
  process.exit(1);
});

export default webBot;
