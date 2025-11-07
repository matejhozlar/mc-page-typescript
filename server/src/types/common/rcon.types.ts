/**
 * RCON connection configuration
 */
export interface RconConfig {
  host: string;
  port: number;
  password: string;
  timeout?: number;
}

/**
 * RCON command result
 */
export interface RconCommandResult {
  command: string;
  response: string;
  timestamp: Date;
  success: boolean;
}
