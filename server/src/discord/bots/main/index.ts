import { Client, GatewayIntentBits, Partials } from "discord.js";
import { loadCommandHandlers } from "./loaders/command-loader";
import { registerInteractionHandler } from "./handlers/interaction-handler";

const mainBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

mainBot.once("clientReady", async () => {
  if (!mainBot.user) {
    logger.error("User is not initialized");
    return;
  }

  logger.info("Logged in as", mainBot.user.tag);
});

(async () => {
  const commandHandlers = await loadCommandHandlers();
  registerInteractionHandler(mainBot, commandHandlers);

  await mainBot.login(process.env.DISCORD_MAIN_BOT_TOKEN);
})().catch((error) => {
  logger.error("Failed to initialize:", error);
  process.exit(1);
});

export default mainBot;
