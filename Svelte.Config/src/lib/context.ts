import { getContext, setContext } from 'svelte';
import { ConfigService, ConfigInitializer } from './service.js';
import type { AppSettings, ConfigProviders, ConfigLoadOptions } from './types.js';
import {
	config,
	configActions,
	configGetters,
	authSettings,
	brandingSettings,
	featureFlags,
	apiUrl,
	isProduction,
	culture,
	appVersion
} from './stores.js';
import { createConfigScopedLogger } from './logger.js';

/**
 * Context key for configuration
 */
const CONFIG_CONTEXT_KEY = Symbol('svelte-config');

/**
 * Configuration context interface
 */
export interface ConfigContext {
	service: ConfigService;
	initializer: ConfigInitializer;
	stores: {
		config: typeof config;
		authSettings: typeof authSettings;
		brandingSettings: typeof brandingSettings;
		featureFlags: typeof featureFlags;
		apiUrl: typeof apiUrl;
		isProduction: typeof isProduction;
		culture: typeof culture;
		appVersion: typeof appVersion;
	};
	actions: typeof configActions;
	getters: typeof configGetters;
}

/**
 * Initialize configuration context
 * Call this in your root layout or app component
 */
export function initConfig(providers: ConfigProviders = {}): ConfigContext {
	const service = new ConfigService();
	const initializer = new ConfigInitializer(providers);

	const context: ConfigContext = {
		service,
		initializer,
		stores: {
			config,
			authSettings,
			brandingSettings,
			featureFlags,
			apiUrl,
			isProduction,
			culture,
			appVersion
		},
		actions: configActions,
		getters: configGetters
	};

	setContext(CONFIG_CONTEXT_KEY, context);
	return context;
}

/**
 * Get configuration context
 * Use this in components that need access to configuration
 */
export function getConfig(): ConfigContext {
	const context = getContext<ConfigContext>(CONFIG_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			'Configuration context not found. Make sure to call initConfig() in your root component.'
		);
	}
	return context;
}

/**
 * Get configuration service from context
 */
export function getConfigService(): ConfigService {
	return getConfig().service;
}

/**
 * Get configuration stores from context
 */
export function getConfigStores() {
	return getConfig().stores;
}

/**
 * Get configuration actions from context
 */
export function getConfigActions() {
	return getConfig().actions;
}

/**
 * Get configuration getters from context
 */
export function getConfigGetters() {
	return getConfig().getters;
}

/**
 * Initialize and load configuration
 * This should be called during app initialization
 */
export async function loadAppConfig(
	providers: ConfigProviders = {},
	options: ConfigLoadOptions = {}
): Promise<AppSettings> {
	const context = getConfig();

	// Set up the initializer with providers
	if (providers.dependencies || providers.defaults || providers.manifestUrl) {
		Object.assign(context.initializer, new ConfigInitializer(providers));
	}

	// Load configuration
	return await context.service.loadConfig(options);
}

/**
 * Reactive configuration utilities for use in components
 * These use stores directly to avoid context access issues
 */
export const configUtils = {
	/**
	 * Get current configuration value
	 */
	getValue: <T = any>(path: string, defaultValue?: T): T => {
		return configGetters.getValue(path, defaultValue);
	},

	/**
	 * Check if feature is enabled
	 */
	isFeatureEnabled: (featureName: string): boolean => {
		return configGetters.isFeatureEnabled(featureName);
	},

	/**
	 * Get authentication setting
	 */
	getAuthSetting: <T = any>(key: string, defaultValue?: T): T => {
		return configGetters.getAuthSetting(key as any, defaultValue);
	},

	/**
	 * Get branding setting
	 */
	getBrandingSetting: <T = any>(key: string, defaultValue?: T): T => {
		return configGetters.getBrandingSetting(key as any, defaultValue);
	},

	/**
	 * Update configuration - uses actions directly
	 */
	updateConfig: (partialSettings: Partial<AppSettings>) => {
		configActions.updateSettings(partialSettings);
	},

	/**
	 * Reset configuration - uses actions directly
	 */
	resetConfig: () => {
		configActions.reset();
	}
};

/**
 * Hook-like function for accessing configuration in components
 * Returns reactive stores and utilities
 */
export function useConfig() {
	const context = getConfig();

	return {
		// Reactive stores
		config: context.stores.config,
		authSettings: context.stores.authSettings,
		brandingSettings: context.stores.brandingSettings,
		featureFlags: context.stores.featureFlags,
		apiUrl: context.stores.apiUrl,
		isProduction: context.stores.isProduction,
		culture: context.stores.culture,
		appVersion: context.stores.appVersion,

		// Actions
		actions: context.actions,

		// Getters
		getters: context.getters,

		// Service
		service: context.service,

		// Utilities
		...configUtils
	};
}

/**
 * Create a scoped configuration context
 * Useful for creating isolated configuration scopes
 */
export function createConfigScope(
	providers: ConfigProviders = {},
	contextKey?: symbol
): ConfigContext {
	const service = new ConfigService();
	const initializer = new ConfigInitializer(providers);

	const context: ConfigContext = {
		service,
		initializer,
		stores: {
			config,
			authSettings,
			brandingSettings,
			featureFlags,
			apiUrl,
			isProduction,
			culture,
			appVersion
		},
		actions: configActions,
		getters: configGetters
	};

	if (contextKey) {
		setContext(contextKey, context);
	}

	return context;
}

/**
 * Utility to check if configuration is initialized
 */
export function isConfigInitialized(): boolean {
	try {
		const context = getConfig();
		return context.getters.getCurrentConfig() !== null;
	} catch {
		return false;
	}
}

/**
 * Wait for configuration to be initialized
 */
export function waitForConfig(timeout: number = 10000): Promise<AppSettings> {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error('Configuration initialization timeout'));
		}, timeout);

		const unsubscribe = config.subscribe(($config) => {
			if ($config) {
				clearTimeout(timeoutId);
				unsubscribe();
				resolve($config);
			}
		});
	});
}

/**
 * Preload configuration without throwing errors
 * Useful for non-critical configuration loading
 */
export async function preloadConfig(
	providers: ConfigProviders = {},
	options: ConfigLoadOptions = {}
): Promise<boolean> {
	const logger = createConfigScopedLogger('preloadConfig');

	try {
		await loadAppConfig(providers, options);
		return true;
	} catch (error) {
		logger.warn('Configuration preload failed:', error);
		return false;
	}
}
