import { configureLogger, LogLevel, ConsoleLogger, type ILogger } from '../logger.js';

/**
 * Example custom logger that sends logs to an external service
 */
export class RemoteLogger implements ILogger {
	constructor(
		private apiEndpoint: string,
		private apiKey: string,
		private minLevel: LogLevel = LogLevel.WARN
	) {}

	private async sendLog(level: string, message: string, data?: any): Promise<void> {
		try {
			await fetch(this.apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`
				},
				body: JSON.stringify({
					level,
					message,
					data,
					timestamp: new Date().toISOString(),
					source: 'svelte-auth'
				})
			});
		} catch (error) {
			// Fallback to console if remote logging fails
			console.error('Failed to send remote log:', error);
			console.log(`[${level}] ${message}`, data);
		}
	}

	trace(message: string, ...args: any[]): void {
		if (LogLevel.TRACE >= this.minLevel) {
			this.sendLog('TRACE', message, args);
		}
	}

	debug(message: string, ...args: any[]): void {
		if (LogLevel.DEBUG >= this.minLevel) {
			this.sendLog('DEBUG', message, args);
		}
	}

	info(message: string, ...args: any[]): void {
		if (LogLevel.INFO >= this.minLevel) {
			this.sendLog('INFO', message, args);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (LogLevel.WARN >= this.minLevel) {
			this.sendLog('WARN', message, args);
		}
	}

	error(message: string, error?: Error | any, ...args: any[]): void {
		if (LogLevel.ERROR >= this.minLevel) {
			this.sendLog('ERROR', message, { error: error?.message, stack: error?.stack, ...args });
		}
	}
}

/**
 * Example Pino logger integration
 */
export class PinoLogger implements ILogger {
	constructor(private pino: any) {}

	trace(message: string, ...args: any[]): void {
		this.pino.trace({ args }, message);
	}

	debug(message: string, ...args: any[]): void {
		this.pino.debug({ args }, message);
	}

	info(message: string, ...args: any[]): void {
		this.pino.info({ args }, message);
	}

	warn(message: string, ...args: any[]): void {
		this.pino.warn({ args }, message);
	}

	error(message: string, error?: Error | any, ...args: any[]): void {
		this.pino.error({ error, args }, message);
	}
}

/**
 * Example Winston logger integration
 */
export class WinstonLogger implements ILogger {
	constructor(private winston: any) {}

	trace(message: string, ...args: any[]): void {
		this.winston.debug(message, { level: 'trace', args });
	}

	debug(message: string, ...args: any[]): void {
		this.winston.debug(message, { args });
	}

	info(message: string, ...args: any[]): void {
		this.winston.info(message, { args });
	}

	warn(message: string, ...args: any[]): void {
		this.winston.warn(message, { args });
	}

	error(message: string, error?: Error | any, ...args: any[]): void {
		this.winston.error(message, { error, args });
	}
}

// Configuration Examples

// 1. Configure with default console logger at DEBUG level
configureLogger({
	level: LogLevel.DEBUG,
	prefix: '[MyApp-Auth]'
});

// 2. Configure with custom remote logger
configureLogger({
	logger: new RemoteLogger('https://api.logs.com/events', 'your-api-key')
});

// 3. Configure with Pino logger
// import pino from 'pino';
// const pinoLogger = pino({ level: 'debug' });
// configureLogger({
//   logger: new PinoLogger(pinoLogger)
// });

// 4. Configure with Winston logger
// import winston from 'winston';
// const winstonLogger = winston.createLogger({
//   level: 'debug',
//   format: winston.format.json(),
//   transports: [new winston.transports.Console()]
// });
// configureLogger({
//   logger: new WinstonLogger(winstonLogger)
// });

// 5. Disable logging entirely
configureLogger({
	enabled: false
});

// 6. Production configuration
configureLogger({
	level: LogLevel.WARN, // Only warn and error in production
	prefix: '[Auth]'
});
