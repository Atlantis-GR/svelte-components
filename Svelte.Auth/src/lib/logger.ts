import type { ILogger } from '@atlantis-gr/svelte-logging-abstractions';
import { LogLevel } from '@atlantis-gr/svelte-logging-abstractions';

// Re-export the abstractions for backward compatibility
export type { ILogger };
export { LogLevel };

export class ConsoleLogger implements ILogger {
	constructor(
		private level: LogLevel = LogLevel.WARN,
		private prefix: string = '[Auth]'
	) {}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.level;
	}

	private formatMessage(level: string, message: string): string {
		const timestamp = new Date().toLocaleTimeString();
		return `${timestamp} ${this.prefix} [${level}] ${message}`;
	}

	trace(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.TRACE)) {
			console.trace(this.formatMessage('TRACE', message), ...args);
		}
	}

	debug(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			console.debug(this.formatMessage('DEBUG', message), ...args);
		}
	}

	info(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.INFO)) {
			console.info(this.formatMessage('INFO', message), ...args);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.WARN)) {
			console.warn(this.formatMessage('WARN', message), ...args);
		}
	}

	error(message: string, error?: Error | any, ...args: any[]): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			if (error instanceof Error) {
				console.error(this.formatMessage('ERROR', message), error, ...args);
			} else {
				console.error(this.formatMessage('ERROR', message), error, ...args);
			}
		}
	}
}

export class SilentLogger implements ILogger {
	trace(): void {}
	debug(): void {}
	info(): void {}
	warn(): void {}
	error(): void {}
}

export interface LoggerConfig {
	logger?: ILogger;
	level?: LogLevel;
	prefix?: string;
	/** Enable/disable logging entirely */
	enabled?: boolean;
}

/**
 * Global logger instance
 */
let globalLogger: ILogger = new ConsoleLogger(LogLevel.INFO);

/**
 * Configure the global logger for the auth library
 */
export function configureLogger(config: LoggerConfig): void {
	if (config.enabled === false) {
		globalLogger = new SilentLogger();
		return;
	}

	if (config.logger) {
		globalLogger = config.logger;
	} else {
		// Use default ConsoleLogger with custom configuration
		const level = config.level ?? LogLevel.INFO;
		const prefix = config.prefix ?? '[SvelteAuth]';
		globalLogger = new ConsoleLogger(level, prefix);
	}
}

/**
 * Get the current global logger instance
 */
export function getLogger(): ILogger {
	return globalLogger;
}

/**
 * Create a scoped logger with a specific prefix
 */
export function createScopedLogger(scope: string): ILogger {
	const baseLogger = getLogger();

	return {
		trace: (message: string, ...args: any[]) => baseLogger.trace(`[${scope}] ${message}`, ...args),
		debug: (message: string, ...args: any[]) => baseLogger.debug(`[${scope}] ${message}`, ...args),
		info: (message: string, ...args: any[]) => baseLogger.info(`[${scope}] ${message}`, ...args),
		warn: (message: string, ...args: any[]) => baseLogger.warn(`[${scope}] ${message}`, ...args),
		error: (message: string, error?: Error | any, ...args: any[]) =>
			baseLogger.error(`[${scope}] ${message}`, error, ...args)
	};
}
