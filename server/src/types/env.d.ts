declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Minecraft
      SERVER_LOADER: string;
      SERVER_NAME: string;
      SERVER_DOMAIN: string;
      COGS_AND_STEAM_SERVER_IP: string;
      COGS_AND_STEAM_SERVER_PORT: string;
      COGS_AND_STEAM_QUERY_PORT: string;
      // Web
      // Links
      WEB_URL: string;
      WEB_MAP_URL: string;
      WEB_ADMIN_PANEL_URL: string;
      WEB_MODPACK_URL: string;
      // Discord
      // General
      DISCORD_GUILD_ID: string;
      // Bots
      DISCORD_MAIN_BOT_TOKEN: string;
      // HTTP Server
      PORT: string;
    }
  }
}

export {};
