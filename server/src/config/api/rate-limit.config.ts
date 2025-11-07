export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const config = {
  /**
   * How long to keep request counts for each client
   */
  windowMs: 15 * 60 * 1000,
  /**
   * How many reuqests a single client can make within windowMs
   */
  max: 1000,
} satisfies RateLimitConfig;

export default config;
