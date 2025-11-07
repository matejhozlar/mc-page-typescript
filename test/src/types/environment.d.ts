declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Servers
      PORT: number;
      COGS_AND_STEAM_SERVER_IP: string;
      COGS_AND_STEAM_SERVER_PORT: string;
      TECHNICA_SERVER_IP: string;
      TECHNICA_SERVER_PORT: string;
      TEST_SERVER_IP: string;
      TEST_SERVER_PORT: string;
      // Database
      DB_USER: string;
      DB_HOST: string;
      DB_DATABASE: string;
      DB_PASSWORD: string;
      DB_PORT: number;
      // Discord Bots
      CLIENT_BOT_ID: string;
      CLIENT_BOT_TOKEN: string;
      WEB_BOT_ID: string;
      WEB_BOT_TOKEN: string;
      DISCORD_GUILD_ID: string;
      // Discord Roles
      DISCORD_TOP_PLAYTIME_ROLE_ID: string;
      DISCORD_UNVERIFIED_ROLE_ID: string;
      DISCORD_PLAYER_ROLE_ID: string;
      DISCORD_ADMIN_ROLE_ID: string;
      DISCORD_OWNER_ROLE_ID: string;
      DISCORD_STONE_ROLE_ID: string;
      DISCORD_COPPER_ROLE_ID: string;
      DISCORD_IRON_ROLE_ID: string;
      DISCORD_GOLD_ROLE_ID: string;
      DISCORD_DIAMOND_ROLE_ID: string;
      DISCORD_CRIMSON_ROLE_ID: string;
      DISCORD_SILVER_ROLE_ID: string;
      DISCORD_ELECTRUM_ROLE_ID: string;
      DISCORD_TYRIAN_ROLE_ID: string;
      DISCORD_ONE_ABOVE_ALL_ROLE_ID: string;
      DISCORD_CRYPTO_BARON_ROLE_ID: string;
      DISCORD_NEWCOMER_ROLE_ID: string;
      DISCORD_ADVENTURER_ROLE_ID: string;
      DISCORD_REGULAR_ROLE_ID: string;
      DISCORD_VETERAN_ROLE_ID: string;
      DISCORD_LEGEND_ROLE_ID: string;
      // Discord Channels
      DISCORD_CHAT_CHANNEL_ID: string;
      DISCORD_VERIFY_CHANNEL_ID: string;
      DISCORD_ANNOUNCEMENT_CHANNEL_ID: string;
      DISCORD_HALL_OF_FAME_CHANNEL_ID: string;
      DISCORD_BOT_COMMANDS_CHANNEL_ID: string;
      DISCORD_DOWNLOAD_GUIDE_CHANNEL_ID: string;
      DISCORD_TICKET_MESSAGE_CHANNEL_ID: string;
      DISCORD_TRANSCRIPT_CHANNEL_ID: string;
      DISCORD_MOD_SUGGESTIONS_CHANNEL_ID: string;
      DISCORD_MOD_DISCUSSION_CHANNEL_ID: string;
      DISCORD_MINECRAFT_CHAT_CHANNEL_ID: string;
      DISCORD_BOT_SPAM_CHANNEL_ID: string;
      DISCORD_LEADERBOARDS_CHANNEL_ID: string;
      DISCORD_ADMIN_CHAT_CHANNEL_ID: string;
      DISCORD_TEST_CHANNEL_ID: string;
      DISCORD_QUESTS_CHANNEL_ID: string;
      DISCORD_MARKET_CHANNEL_ID: string;
      DISCORD_COMPANIES_CHANNEL_ID: string;
      DISCORD_RULES_CHANNEL_ID: string;
      DISCORD_WEBSITE_BUGS_CHANNEL_ID: string;
      DISCORD_SUPPORT_TICKET_CHANNEL_ID: string;
      DISCORD_MEMBERS_COUNTER_CHANNEL_ID: string;
      DISCORD_BOTS_COUNTER_CHANNEL_ID: string;
      DISCORD_ALL_MEMBERS_CHANNEL_ID: string;
      DISCORD_CURRENCY_CHANNEL_ID: string;
      DISCORD_CRYPTO_CHANNEL_ID: string;
      // Rcon settings
      COGS_AND_STEAM_RCON_PORT: number;
      COGS_AND_STEAM_RCON_PASSWORD: string;
      TECHNICA_RCON_PORT: number;
      TECHNICA_RCON_PASSWORD: string;
      TEST_SERVER_RCON_PORT: number;
      TEST_SERVER_RCON_PASSWORD: string;
      // Email
      EMAIL_PASSWORD: string;
      EMAIL_ADDRESS: string;
      EMAIL_PORT: number;
      EMAIL_HOST: string;
      NOTIFY_ADMIN_EMAIL: string;
      // Discord OAuth
      GAME_LOGIN_CLIENT_ID: string;
      GAME_LOGIN_CLIENT_SECRET: string;
      GAME_LOGIN_REDIRECT_URI: string;
      GAME_LOGIN_REDIRECT_URI_PRODUCTION: string;
      CRYPTO_LOGIN_CLIENT_ID: string;
      CRYPTO_LOGIN_CLIENT_SECRET: string;
      CRYPTO_LOGIN_REDIRECT_URI: string;
      CRYPTO_LOGIN_REDIRECT_URI_PRODUCTION: string;
      ADMIN_LOGIN_CLIENT_ID: string;
      ADMIN_LOGIN_CLIENT_SECRET: string;
      ADMIN_LOGIN_REDIRECT_URI: string;
      ADMIN_LOGIN_REDIRECT_URI_PRODUCTION: string;
      MARKET_LOGIN_REDIRECT_URI: string;
      MARKET_LOGIN_REDIRECT_URI_PRODUCTION: string;
      // SFTP
      SFTP_HOST: string;
      SFTP_PORT: number;
      SFTP_USER: string;
      SFTP_PASS: string;
      // OpenAI Token
      OPENAI_API_KEY: string;
      // Currency mod API
      JWT_SECRET: string;
      COOKIE_SECRET: string;
      ALLOWED_IP_ADDRESS_COGS_AND_STEAM: string;
      ALLOWED_IP_ADDRESS_TECHNICA: string;
      ALLOWED_IP_ADDRESS_LOCAL: string;
      // Assets download API
      ASSET_DOWNLOAD_CODE: string;
      // R2 Bucket
      R2_BUCKET_NAME: string;
      R2_REGION: string;
      R2_ACCOUNT_ID: string;
      R2_TOKEN: string;
      R2_ACCESS_KEY_ID: string;
      R2_SECRET_ACCESS_KEY: string;
      R2_ENDPOINT: string;
      // Prod
      NODE_ENV: "production" | "development";
    }
  }
}

export {};
