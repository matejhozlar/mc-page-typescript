declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Minecraft
      COGS_AND_STEAM_SERVER_IP: string;
      COGS_AND_STEAM_SERVER_PORT: string;
      // Rcon
      COGS_AND_STEAM_RCON_PORT: string;
      COGS_AND_STEAM_RCON_PASSWORD: string;
    }
  }
}

export {};
