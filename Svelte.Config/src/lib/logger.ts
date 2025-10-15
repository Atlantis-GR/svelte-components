import type { ILogger } from '@atlantis-gr/svelte-logging-abstractions';
import { LogLevel } from '@atlantis-gr/svelte-logging-abstractions';

/**
 * Default console logger implementation for when no logger is configured
 */
class DefaultConfigLogger implements ILogger {
  trace(message: string, ...args: any[]): void {
    console.debug(`[Config] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`[Config] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`[Config] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[Config] ${message}`, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (error instanceof Error) {
      console.error(`[Config] ${message}`, error, ...args);
    } else {
      console.error(`[Config] ${message}`, error, ...args);
    }
  }
}

/**
 * Global logger instance for the config package
 */
let configLogger: ILogger = new DefaultConfigLogger();

/**
 * Configure the logger for the config package
 */
export function configureConfigLogger(logger: ILogger): void {
  configLogger = logger;
}

/**
 * Get the current config logger instance
 */
export function getConfigLogger(): ILogger {
  return configLogger;
}

/**
 * Create a scoped logger with a specific prefix for config operations
 */
export function createConfigScopedLogger(scope: string): ILogger {
  const baseLogger = getConfigLogger();
  
  return {
    trace: (message: string, ...args: any[]) => baseLogger.trace(`[${scope}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => baseLogger.debug(`[${scope}] ${message}`, ...args),
    info: (message: string, ...args: any[]) => baseLogger.info(`[${scope}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => baseLogger.warn(`[${scope}] ${message}`, ...args),
    error: (message: string, error?: Error | any, ...args: any[]) => baseLogger.error(`[${scope}] ${message}`, error, ...args)
  };
}