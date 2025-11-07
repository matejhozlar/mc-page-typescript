export const REQUIRED_VARS = [
      "COOKIE_SECRET",
  "DB_DATABASE",
  "DB_HOST",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_USER",
  "DISCORD_MINECRAFT_CHAT_CHANNEL_ID",
  "NODE_ENV",
  "PORT",
  "TEST_DATABASE_URL",
    ] as const;

    export type RequiredVar = typeof REQUIRED_VARS[number];
    export default REQUIRED_VARS;
    