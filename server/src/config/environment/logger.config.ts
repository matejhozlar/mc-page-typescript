export interface LoggerConfig {
  /**
   * Root directory where daily log folders/files are written.
   * Relative paths are resolved from the process working directory.
   */
  LOG_DIR: string;
  /**
   * Number of days to retain dated log folders before automatic cleanup.
   * Older folders beyond this threshold may be deleted.
   */
  KEEP_DAYS: number;
}

const config = {
  LOG_DIR: "logs",
  KEEP_DAYS: 7,
} satisfies LoggerConfig;

export default config;
