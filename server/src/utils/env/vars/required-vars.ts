export const REQUIRED_VARS = [
  "COGS_AND_STEAM_RCON_PASSWORD",
  "COGS_AND_STEAM_RCON_PORT",
  "COGS_AND_STEAM_SERVER_IP",
  "NODE_ENV",
] as const;

export type RequiredVar = (typeof REQUIRED_VARS)[number];
export default REQUIRED_VARS;
