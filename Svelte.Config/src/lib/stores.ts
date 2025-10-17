import { writable, derived, readable } from 'svelte/store';
import type {
	AppSettings,
	ConfigState,
	AuthSettings,
	BrandingSettings,
	ConfigLoadOptions
} from './types.js';
import { DEFAULT_APP_SETTINGS } from './types.js';

/**
 * Internal configuration state store
 */
const configState = writable<ConfigState>({
	settings: null,
	loading: false,
	error: null,
	initialized: false,
	lastUpdated: null
});

/**
 * Main configuration store - reactive to state changes
 */
export const config = derived(configState, ($state) => $state.settings);

/**
 * Loading state store
 */
export const configLoading = derived(configState, ($state) => $state.loading);

/**
 * Error state store
 */
export const configError = derived(configState, ($state) => $state.error);

/**
 * Initialization state store
 */
export const configInitialized = derived(configState, ($state) => $state.initialized);

/**
 * Last updated timestamp store
 */
export const configLastUpdated = derived(configState, ($state) => $state.lastUpdated);

/**
 * Authentication settings store - derived from main config
 */
export const authSettings = derived(
	config,
	($config) => $config?.auth_settings || (DEFAULT_APP_SETTINGS.auth_settings as AuthSettings)
);

/**
 * Branding settings store - derived from main config
 */
export const brandingSettings = derived(
	config,
	($config) => $config?.branding || (DEFAULT_APP_SETTINGS.branding as BrandingSettings)
);

/**
 * Feature flags store - derived from main config
 */
export const featureFlags = derived(config, ($config) => $config?.features || {});

/**
 * API URL store - commonly accessed setting
 */
export const apiUrl = derived(config, ($config) => $config?.api_url || '');

/**
 * Production mode store
 */
export const isProduction = derived(config, ($config) => $config?.production || false);

/**
 * Culture/locale store
 */
export const culture = derived(config, ($config) => $config?.culture || 'en-US');

/**
 * App version store
 */
export const appVersion = derived(config, ($config) => $config?.version || '1.0.0');

/**
 * Configuration store actions
 */
export const configActions = {
	/**
	 * Set loading state
	 */
	setLoading: (loading: boolean) => {
		configState.update((state) => ({
			...state,
			loading,
			error: loading ? null : state.error
		}));
	},

	/**
	 * Set error state
	 */
	setError: (error: Error | null) => {
		configState.update((state) => ({
			...state,
			error,
			loading: false
		}));
	},

	/**
	 * Update configuration settings
	 */
	setSettings: (settings: AppSettings) => {
		configState.update((state) => ({
			...state,
			settings,
			loading: false,
			error: null,
			initialized: true,
			lastUpdated: new Date()
		}));
	},

	/**
	 * Merge partial settings with existing configuration
	 */
	updateSettings: (partialSettings: Partial<AppSettings>) => {
		configState.update((state) => {
			if (!state.settings) return state;

			// Deep merge for nested objects
			const updatedSettings = {
				...state.settings,
				...partialSettings
			};

			// Special handling for nested objects
			if (partialSettings.features && state.settings.features) {
				updatedSettings.features = {
					...state.settings.features,
					...partialSettings.features
				};
			}

			if (partialSettings.branding && state.settings.branding) {
				updatedSettings.branding = {
					...state.settings.branding,
					...partialSettings.branding
				};
			}

			if (partialSettings.app && state.settings.app) {
				updatedSettings.app = {
					...state.settings.app,
					...partialSettings.app
				};
			}

			if (partialSettings.auth_settings && state.settings.auth_settings) {
				updatedSettings.auth_settings = {
					...state.settings.auth_settings,
					...partialSettings.auth_settings
				};
			}

			return {
				...state,
				settings: updatedSettings,
				lastUpdated: new Date()
			};
		});
	},

	/**
	 * Reset configuration to initial state
	 */
	reset: () => {
		configState.set({
			settings: null,
			loading: false,
			error: null,
			initialized: false,
			lastUpdated: null
		});
	},

	/**
	 * Initialize with default settings
	 */
	initializeDefaults: (defaults?: Partial<AppSettings>) => {
		const settings = {
			...DEFAULT_APP_SETTINGS,
			...defaults
		} as AppSettings;

		configState.update((state) => ({
			...state,
			settings,
			initialized: true,
			lastUpdated: new Date()
		}));
	}
};

/**
 * Configuration getter utilities
 */
export const configGetters = {
	/**
	 * Get current configuration value synchronously
	 */
	getCurrentConfig: (): AppSettings | null => {
		let currentConfig: AppSettings | null = null;
		configState.subscribe((state) => {
			currentConfig = state.settings;
		})();
		return currentConfig;
	},

	/**
	 * Get a specific configuration value by path
	 */
	getValue: <T = any>(path: string, defaultValue?: T): T => {
		const config = configGetters.getCurrentConfig();
		if (!config) return defaultValue as T;

		return (path.split('.').reduce((obj, key) => obj?.[key], config) || defaultValue) as T;
	},

	/**
	 * Check if a feature flag is enabled
	 */
	isFeatureEnabled: (featureName: string): boolean => {
		const config = configGetters.getCurrentConfig();
		return config?.features?.[featureName] === true;
	},

	/**
	 * Get authentication setting
	 */
	getAuthSetting: <T = any>(key: keyof AuthSettings, defaultValue?: T): T => {
		const config = configGetters.getCurrentConfig();
		return (config?.auth_settings?.[key] as T) || (defaultValue as T);
	},

	/**
	 * Get branding setting
	 */
	getBrandingSetting: <T = any>(key: keyof BrandingSettings, defaultValue?: T): T => {
		const config = configGetters.getCurrentConfig();
		return (config?.branding?.[key] as T) || (defaultValue as T);
	}
};

/**
 * Create a custom derived store for specific config sections
 */
export function createConfigSection<T>(selector: (config: AppSettings | null) => T) {
	return derived(config, selector);
}

/**
 * Create a reactive store for a specific configuration path
 */
export function createConfigPath<T>(path: string, defaultValue?: T) {
	return derived(config, ($config) => {
		if (!$config) return defaultValue as T;
		return path.split('.').reduce((obj, key) => obj?.[key], $config) || defaultValue;
	});
}

/**
 * Create a feature flag store
 */
export function createFeatureFlag(featureName: string) {
	return derived(featureFlags, ($features) => $features[featureName] === true);
}

/**
 * Environment-specific configuration store
 */
export const environmentConfig = derived([config, isProduction], ([$config, $isProduction]) => {
	if (!$config) return null;

	const environment = $isProduction ? 'production' : 'development';
	return $config.environment?.[environment] || null;
});

/**
 * Utility to subscribe to configuration changes with cleanup
 */
export function onConfigChange(callback: (config: AppSettings | null) => void) {
	return config.subscribe(callback);
}
