export interface RateLimitConfig {
  WINDOW_MS: number;
  MAX: number;
}

const config = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX: 1000,
} satisfies RateLimitConfig;

export default config;
