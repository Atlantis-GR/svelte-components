/**
 * Logger interface for Svelte components
 * Implement this interface to provide custom logging
 */
export interface ILogger {
  /**
   * Log trace information (most verbose)
   */
  trace(message: string, ...args: any[]): void;

  /**
   * Log debug information
   */
  debug(message: string, ...args: any[]): void;

  /**
   * Log informational messages
   */
  info(message: string, ...args: any[]): void;

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void;

  /**
   * Log error messages
   */
  error(message: string, error?: Error | any, ...args: any[]): void;
}

/**
 * Log levels for controlling output
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 5
}