export interface MaintainerConfig {
  EMAIL: string;
  DISCORD: string;
}

const config = {
  EMAIL: "admin@create-rington.com",
  DISCORD: "matejhoz",
} satisfies MaintainerConfig;

export default config;
