import { writable } from 'svelte/store';
import { configureLogger, getLogger, LogLevel } from '@atlantis-gr/svelte-auth';
import type { ILogger } from '@atlantis-gr/svelte-logging-abstractions';

// Persistent store for logs that survives navigation
export const logsStore = writable<Array<{ level: string; message: string; timestamp: Date; args?: any[] }>>([]);

// Track total logs created (for demonstration)
export const totalLogsCreated = writable(0);

// Track if logger has been configured globally
let isLoggerConfigured = false;
let memoryLoggerInstance: PersistentMemoryLogger | null = null;

// Persistent memory logger implementation
export class PersistentMemoryLogger implements ILogger {
	private hasLoggedConfig = false;
	public readonly isMemoryLogger = true; // Unique identifier
	
	constructor(private minLevel: LogLevel = LogLevel.INFO) {}

	// Method to update the minimum log level
	setLogLevel(level: LogLevel): void {
		this.minLevel = level;
	}

	// Method to get current log level
	getLogLevel(): LogLevel {
		return this.minLevel;
	}

	private addLog(level: string, message: string, ...args: any[]): void {
		// Increment total logs counter
		totalLogsCreated.update(n => n + 1);
		
		logsStore.update(currentLogs => {
			const newLogs = [...currentLogs, {
				level,
				message,
				timestamp: new Date(),
				args: args.length > 0 ? args : undefined
			}];
			
			// Keep only last 100 logs for better history
			return newLogs.length > 100 ? newLogs.slice(-100) : newLogs;
		});
	}

	trace(message: string, ...args: any[]): void {
		if (!message || this.minLevel > LogLevel.TRACE) return;
		console.trace(message, ...args);
		this.addLog('TRACE', message, ...args);
	}

	debug(message: string, ...args: any[]): void {
		if (!message || this.minLevel > LogLevel.DEBUG) return;
		console.debug(message, ...args);
		this.addLog('DEBUG', message, ...args);
	}

	info(message: string, ...args: any[]): void {
		if (!message || this.minLevel > LogLevel.INFO) return;
		console.info(message, ...args);
		this.addLog('INFO', message, ...args);
	}

	warn(message: string, ...args: any[]): void {
		if (!message || this.minLevel > LogLevel.WARN) return;
		console.warn(message, ...args);
		this.addLog('WARN', message, ...args);
	}

	error(message: string, error?: Error | any, ...args: any[]): void {
		if (!message || this.minLevel > LogLevel.ERROR) return;
		console.error(message, error, ...args);
		this.addLog('ERROR', message, error, ...args);
	}

	clear(): void {
		logsStore.set([]);
	}

	hasLoggedConfiguration(): boolean {
		return this.hasLoggedConfig;
	}

	markConfigurationLogged(): void {
		this.hasLoggedConfig = true;
	}
}

// Singleton instance with persistent configuration
export const memoryLogger = (() => {
	if (!memoryLoggerInstance) {
		memoryLoggerInstance = new PersistentMemoryLogger();
	}
	return memoryLoggerInstance;
})();

// Enhanced configuration function that ensures our logger stays active
export function ensureMemoryLoggerConfigured(level: LogLevel = LogLevel.INFO) {
	// Update the log level on our existing instance
	if (memoryLoggerInstance) {
		memoryLoggerInstance.setLogLevel(level);
	}
	
	// Always reconfigure to ensure our logger is active
	configureLogger({
		logger: memoryLogger,
		level: level
	});
	isLoggerConfigured = true;
	
	// Add a test log to verify it's working (only log this once per session)
	if (!memoryLoggerInstance?.hasLoggedConfiguration()) {
		memoryLogger.info('Memory logger configured', { 
			level: LogLevel[level], 
			numericLevel: level,
			willLogTrace: level <= LogLevel.TRACE,
			willLogDebug: level <= LogLevel.DEBUG,
			willLogInfo: level <= LogLevel.INFO,
			willLogWarn: level <= LogLevel.WARN,
			willLogError: level <= LogLevel.ERROR
		});
		memoryLoggerInstance?.markConfigurationLogged();
	}
}

// Helper to check/set logger configuration status
export const getIsLoggerConfigured = () => isLoggerConfigured;
export const setLoggerConfigured = () => { isLoggerConfigured = true; };

// Function to reconfigure logger with a new level
export function reconfigureMemoryLogger(newLevel: LogLevel) {
	ensureMemoryLoggerConfigured(newLevel);
	memoryLogger.info(`Logger reconfigured to level: ${LogLevel[newLevel]} (${newLevel})`);
}

// Get current log level
export function getCurrentLogLevel(): LogLevel {
	return memoryLoggerInstance?.getLogLevel() ?? LogLevel.INFO;
}

// Check if our memory logger is still the active global logger
export function isMemoryLoggerActive(): boolean {
	try {
		const currentLogger = getLogger();
		// Check for our unique identifier
		return currentLogger && (currentLogger as any).isMemoryLogger === true;
	} catch (error) {
		console.warn('Error checking logger status:', error);
		return false;
	}
}