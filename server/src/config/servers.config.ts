import { env } from "./env/env.config";

interface RconConfig {
  readonly port: number;
  readonly password: string;
}

interface ServerConfig {
  readonly name: string;
  readonly ip: string;
  readonly port: number;
  readonly rcon: RconConfig;
}

export interface ServersConfig {
  readonly name: string;
  readonly cogs: ServerConfig;
}

const config: ServersConfig = {
  name: "Createrington",
  cogs: {
    name: "Createrington: Cogs & Steam",
    ip: env.COGS_AND_STEAM_SERVER_IP,
    port: env.COGS_AND_STEAM_SERVER_PORT,
    rcon: {
      port: env.COGS_AND_STEAM_RCON_PORT,
      password: env.COGS_AND_STEAM_RCON_PASSWORD,
    },
  },
} as const;

export default config;
