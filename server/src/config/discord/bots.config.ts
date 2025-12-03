import { env } from "../env/env.config";

interface BotConfig {
  /**
   * Discord application/bot ID used for identification
   * Required for registering slash commands and API interactions
   */
  readonly id: string;
  /**
   * Discord bot authentication token
   * Used to authenticate and login the bot to Discord's gateway
   */
  readonly token: string;
}

export interface BotsConfig {
  readonly main: BotConfig;
}

const config: BotsConfig = {
  main: {
    id: env.DISCORD_MAIN_BOT_ID,

    token: env.DISCORD_MAIN_BOT_TOKEN,
  },
} as const;

export default config;
