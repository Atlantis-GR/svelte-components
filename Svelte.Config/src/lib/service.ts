import { merge, cloneDeep } from 'lodash-es';
import type { AppSettings, ConfigLoadOptions, ConfigProviders } from './types.js';
import { DEFAULT_APP_SETTINGS, DEFAULT_CONFIG_OPTIONS, isAppSettings } from './types.js';
import { configActions } from './stores.js';
import { createConfigScopedLogger } from './logger.js';

/**
 * Configuration service class
 * Handles fetching, caching, and managing application configuration
 */
export class ConfigService {
	private cache: Map<string, { data: AppSettings; timestamp: number }> = new Map();
	private retryTimeouts: Map<string, number> = new Map();
	private reloadInterval: number | null = null;
	private currentOptions: ConfigLoadOptions | null = null;
	private isReloading: boolean = false;
	private logger = createConfigScopedLogger('ConfigService');

	/**
	 * Load configuration from a remote source
	 */
	public async loadConfig(options: ConfigLoadOptions = {}): Promise<AppSettings> {
		const opts = { ...DEFAULT_CONFIG_OPTIONS, ...options };

		configActions.setLoading(true);

		try {
			// Check cache first
			if (opts.useCache && opts.cacheKey) {
				const cached = this.getCachedConfig(opts.cacheKey);
				if (cached) {
					configActions.setSettings(cached);
					return cached;
				}
			}

			// Fetch from remote
			const config = await this.fetchWithRetry(opts.url!, opts);

			// Validate if required
			if (opts.validate && !this.validateConfig(config)) {
				throw new Error('Configuration validation failed');
			}

			// Merge with defaults
			const mergedConfig = this.mergeWithDefaults(config, opts.fallback);

			// Cache the result
			if (opts.useCache && opts.cacheKey) {
				this.setCachedConfig(opts.cacheKey, mergedConfig);
			}

			configActions.setSettings(mergedConfig);

			// Set up periodic reloading if enabled
			this.setupPeriodicReload(opts);

			return mergedConfig;
		} catch (error) {
			const err = error instanceof Error ? error : new Error('Failed to load configuration');

			// Try fallback configuration
			if (opts.fallback) {
				this.logger.warn('Using fallback configuration due to error:', err.message);
				const fallbackConfig = this.mergeWithDefaults({}, opts.fallback);
				configActions.setSettings(fallbackConfig);

				// Set up periodic reloading even with fallback to retry later
				this.setupPeriodicReload(opts);

				return fallbackConfig;
			}

			configActions.setError(err);
			throw err;
		}
	}

	/**
	 * Fetch configuration with retry logic
	 */
	private async fetchWithRetry(
		url: string,
		options: ConfigLoadOptions,
		attempt: number = 1
	): Promise<any> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), options.timeout);

			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					Accept: 'application/json',
					'Cache-Control': 'no-cache'
				}
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const config = await response.json();
			return config;
		} catch (error) {
			if (attempt < (options.retries || 1)) {
				const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
				await this.delay(delay);
				return this.fetchWithRetry(url, options, attempt + 1);
			}
			throw error;
		}
	}

	/**
	 * Merge configuration with defaults
	 */
	private mergeWithDefaults(config: any, fallback?: Partial<AppSettings>): AppSettings {
		const defaults = cloneDeep(DEFAULT_APP_SETTINGS);
		const merged = merge(defaults, fallback || {}, config);

		// Ensure required fields are present
		if (!merged.api_url) merged.api_url = '';
		if (!merged.culture) merged.culture = 'en-US';
		if (!merged.version) merged.version = '1.0.0';

		return merged as AppSettings;
	}

	/**
	 * Validate configuration structure
	 */
	private validateConfig(config: any): boolean {
		if (!isAppSettings(config)) {
			this.logger.error('Configuration validation failed: Invalid structure');
			return false;
		}

		// Additional validation rules can be added here
		if (config.auth_settings && !config.auth_settings.authority) {
			this.logger.warn('Auth settings present but missing authority');
		}

		return true;
	}

	/**
	 * Get cached configuration
	 */
	private getCachedConfig(cacheKey: string): AppSettings | null {
		try {
			// Check memory cache first
			const memoryCache = this.cache.get(cacheKey);
			if (memoryCache && Date.now() - memoryCache.timestamp < 300000) {
				// 5 minutes
				return memoryCache.data;
			}

			// Check localStorage
			if (typeof localStorage !== 'undefined') {
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const parsed = JSON.parse(cached);
					if (Date.now() - parsed.timestamp < 3600000) {
						// 1 hour
						return parsed.data;
					}
				}
			}
		} catch (error) {
			this.logger.warn('Failed to read cached configuration:', error);
		}

		return null;
	}

	/**
	 * Set cached configuration
	 */
	private setCachedConfig(cacheKey: string, config: AppSettings): void {
		try {
			const cacheEntry = {
				data: config,
				timestamp: Date.now()
			};

			// Store in memory cache
			this.cache.set(cacheKey, cacheEntry);

			// Store in localStorage
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
			}
		} catch (error) {
			this.logger.warn('Failed to cache configuration:', error);
		}
	}

	/**
	 * Clear configuration cache
	 */
	public clearCache(cacheKey?: string): void {
		if (cacheKey) {
			this.cache.delete(cacheKey);
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(cacheKey);
			}
		} else {
			this.cache.clear();
			if (typeof localStorage !== 'undefined') {
				// Clear all config-related items
				const keys = Object.keys(localStorage);
				keys.forEach((key) => {
					if (key.includes('config') || key.includes('app-config')) {
						localStorage.removeItem(key);
					}
				});
			}
		}
	}

	/**
	 * Preload configuration (fire and forget)
	 */
	public async preloadConfig(options: ConfigLoadOptions = {}): Promise<void> {
		try {
			await this.loadConfig(options);
		} catch (error) {
			this.logger.warn('Configuration preload failed:', error);
		}
	}

	/**
	 * Utility delay function
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Set up periodic reloading of configuration
	 */
	private setupPeriodicReload(options: ConfigLoadOptions): void {
		// Stop any existing reload interval
		this.stopPeriodicReload();

		if (!options.periodicReload || !options.reloadInterval) {
			return;
		}

		// Store current options for reloading
		this.currentOptions = { ...options };

		this.logger.info(`Setting up periodic config reload every ${options.reloadInterval}ms`);

		this.reloadInterval = window.setInterval(async () => {
			if (this.isReloading) {
				this.logger.debug('Skipping periodic reload - already in progress');
				return;
			}

			try {
				this.isReloading = true;
				this.logger.debug('Performing periodic configuration reload...');

				// Create reload options (force fresh fetch, optionally silent)
				const reloadOptions: ConfigLoadOptions = {
					...this.currentOptions,
					useCache: false // Force fresh fetch
				};

				// Set loading state only if not silent
				if (!options.silentReload) {
					configActions.setLoading(true);
				}

				await this.loadConfig(reloadOptions);

				this.logger.debug('Periodic configuration reload completed successfully');
			} catch (error) {
				this.logger.warn('Periodic configuration reload failed:', error);
				// Don't throw error - just log and continue with periodic attempts
			} finally {
				this.isReloading = false;
				if (!options.silentReload) {
					configActions.setLoading(false);
				}
			}
		}, options.reloadInterval);
	}

	/**
	 * Stop periodic reloading
	 */
	public stopPeriodicReload(): void {
		if (this.reloadInterval !== null) {
			this.logger.info('Stopping periodic configuration reload');
			clearInterval(this.reloadInterval);
			this.reloadInterval = null;
			this.currentOptions = null;
		}
	}

	/**
	 * Manually trigger a configuration reload
	 */
	public async reloadNow(silent: boolean = true): Promise<AppSettings> {
		if (!this.currentOptions) {
			throw new Error('No configuration loaded yet - cannot reload');
		}

		const reloadOptions: ConfigLoadOptions = {
			...this.currentOptions,
			useCache: false,
			silentReload: silent
		};

		return await this.loadConfig(reloadOptions);
	}

	/**
	 * Check if periodic reloading is active
	 */
	public isPeriodicReloadActive(): boolean {
		return this.reloadInterval !== null;
	}

	/**
	 * Get current reload interval in milliseconds
	 */
	public getReloadInterval(): number | null {
		return this.currentOptions?.reloadInterval || null;
	}
}

/**
 * Configuration initializer
 */
export class ConfigInitializer {
	private providers: ConfigProviders;
	private service: ConfigService;
	private logger = createConfigScopedLogger('ConfigInitializer');

	constructor(providers: ConfigProviders = {}) {
		this.providers = providers;
		this.service = new ConfigService();
	}

	/**
	 * Initialize configuration and dependencies
	 */
	async initialize(): Promise<boolean> {
		try {
			// Load configuration
			const options: ConfigLoadOptions = {
				url: this.providers.manifestUrl || '/app-settings.manifest.json',
				fallback: this.providers.defaults,
				useCache: true,
				cacheKey: 'app-config',
				validate: true
			};

			const config = await this.service.loadConfig(options);

			// Initialize dependencies if provided
			if (this.providers.dependencies) {
				await this.initializeDependencies(config);
			}

			return true;
		} catch (error) {
			this.logger.error('Configuration initialization failed:', error);
			return false;
		}
	}

	/**
	 * Initialize additional dependencies
	 */
	private async initializeDependencies(config: AppSettings): Promise<void> {
		if (!this.providers.dependencies) return;

		const promises = this.providers.dependencies.map(async (dep) => {
			try {
				if (typeof dep === 'function') {
					await dep(config);
				} else if (dep && typeof dep.initialize === 'function') {
					await dep.initialize(config);
				}
			} catch (error) {
				this.logger.warn('Failed to initialize dependency:', error);
			}
		});

		await Promise.allSettled(promises);
	}

	/**
	 * Get the configuration service instance
	 */
	getService(): ConfigService {
		return this.service;
	}
}

/**
 * Create and configure a new configuration service
 */
export function createConfigService(providers?: ConfigProviders): ConfigService {
	const initializer = new ConfigInitializer(providers);
	return initializer.getService();
}

/**
 * Initialize configuration with providers
 */
export async function initializeConfig(providers?: ConfigProviders): Promise<boolean> {
	const initializer = new ConfigInitializer(providers);
	return await initializer.initialize();
}

/**
 * Singleton instance for convenience
 */
export const defaultConfigService = new ConfigService();
