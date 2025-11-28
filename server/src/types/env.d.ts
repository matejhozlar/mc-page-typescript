declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Discord
      // Bots
      DISCORD_MAIN_BOT_TOKEN: string;
      // HTTP Server
      PORT: string;
    }
  }
}

export {};
