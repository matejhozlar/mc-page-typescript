import { env } from "./env/env.config";

export interface AppConfig {
  readonly port: number;
}

const config: AppConfig = {
  port: env.PORT,
} as const;

export default config;
