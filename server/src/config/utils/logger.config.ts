export interface LoggerConfig {
  /**
   * Root directory where daily log folders/files are written
   * Relative paths are resolved from the process working directory
   */
  readonly logDir: string;
  /**
   * Number of days to retain dated log folders before automatic cleanup
   * Older folders beyond this threshold may be deleted
   */
  readonly keepDays: number;
}

const config: LoggerConfig = {
  logDir: "logs",
  keepDays: 7,
} as const;

export default config;
