export interface ServerConfig {
  serverName: string;
  serverDomain: string;
  serverLoader: string;
}

const config = {
  serverName: process.env.SERVER_NAME,
  serverDomain: process.env.SERVER_DOMAIN,
  serverLoader: process.env.SERVER_LOADER,
} satisfies ServerConfig;

export default config;
