import type { AuthSettings } from './types.js';
import { configGetters, authSettings } from './stores.js';

/**
 * Auth integration utilities for seamless integration with Svelte.Auth
 * These utilities provide a bridge between the config library and auth library
 * without creating hard dependencies
 */

/**
 * Get auth settings in a format compatible with Svelte.Auth
 */
export function getAuthConfig(): AuthSettings | null {
	const config = configGetters.getCurrentConfig();
	return config?.auth_settings || null;
}

/**
 * Create auth settings provider for Svelte.Auth
 * Returns a function that can be used to initialize Svelte.Auth
 */
export function createAuthProvider() {
	return () => {
		const config = configGetters.getCurrentConfig();
		if (!config?.auth_settings) {
			throw new Error('Authentication settings not found in configuration');
		}
		return config.auth_settings;
	};
}

/**
 * Watch for auth settings changes and notify callback
 * Useful for reinitializing auth when configuration changes
 */
export function watchAuthSettings(callback: (settings: AuthSettings | null) => void) {
	return authSettings.subscribe(callback);
}

/**
 * Get a specific auth setting value
 */
export function getAuthSetting<T = any>(key: keyof AuthSettings, defaultValue?: T): T {
	return configGetters.getAuthSetting(key, defaultValue);
}

/**
 * Check if auth is configured
 */
export function isAuthConfigured(): boolean {
	const settings = getAuthConfig();
	return !!(settings?.authority && settings?.client_id && settings?.redirect_uri);
}

/**
 * Validate auth configuration
 */
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
	const settings = getAuthConfig();
	const errors: string[] = [];

	if (!settings) {
		errors.push('Authentication settings not found');
		return { valid: false, errors };
	}

	if (!settings.authority) {
		errors.push('Authority is required');
	}

	if (!settings.client_id) {
		errors.push('Client ID is required');
	}

	if (!settings.redirect_uri) {
		errors.push('Redirect URI is required');
	}

	if (!settings.scope) {
		errors.push('Scope is required');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Create auth settings with environment-specific overrides
 */
export function createAuthSettings(overrides: Partial<AuthSettings> = {}): AuthSettings | null {
	const baseSettings = getAuthConfig();
	if (!baseSettings) return null;

	return {
		...baseSettings,
		...overrides
	};
}

/**
 * Get redirect URIs with current origin if relative
 */
export function getResolvedAuthSettings(): AuthSettings | null {
	const settings = getAuthConfig();
	if (!settings) return null;

	const origin = typeof window !== 'undefined' ? window.location.origin : '';

	return {
		...settings,
		redirect_uri: settings.redirect_uri.startsWith('http')
			? settings.redirect_uri
			: `${origin}${settings.redirect_uri}`,
		post_logout_redirect_uri: settings.post_logout_redirect_uri.startsWith('http')
			? settings.post_logout_redirect_uri
			: `${origin}${settings.post_logout_redirect_uri}`,
		silent_redirect_uri: settings.silent_redirect_uri?.startsWith('http')
			? settings.silent_redirect_uri
			: `${origin}${settings.silent_redirect_uri || '/auth-renew'}`
	};
}

/**
 * Auth utility functions for specific integrations
 */
export const authUtils = {
	getConfig: getAuthConfig,
	createProvider: createAuthProvider,
	watch: watchAuthSettings,
	getSetting: getAuthSetting,
	isConfigured: isAuthConfigured,
	validate: validateAuthConfig,
	create: createAuthSettings,
	resolve: getResolvedAuthSettings
};

/**
 * Type-safe auth configuration accessor
 */
export interface AuthConfigAccessor {
	authority: string;
	clientId: string;
	redirectUri: string;
	postLogoutRedirectUri: string;
	scope: string;
	responseType: string;
	silentRedirectUri?: string;
	automaticSilentRenew?: boolean;
	accessTokenExpiringNotificationTime?: number;
	monitorSession?: boolean;
	revokeAccessTokenOnSignout?: boolean;
	filterProtocolClaims?: boolean;
	loadUserInfo?: boolean;
	extraQueryParams?: Record<string, string>;
	acrValues?: string;
}

/**
 * Get type-safe auth configuration
 */
export function getTypedAuthConfig(): AuthConfigAccessor | null {
	const settings = getResolvedAuthSettings();
	if (!settings) return null;

	return {
		authority: settings.authority,
		clientId: settings.client_id,
		redirectUri: settings.redirect_uri,
		postLogoutRedirectUri: settings.post_logout_redirect_uri,
		scope: settings.scope,
		responseType: settings.response_type,
		silentRedirectUri: settings.silent_redirect_uri,
		automaticSilentRenew: settings.automaticSilentRenew,
		accessTokenExpiringNotificationTime: settings.accessTokenExpiringNotificationTime,
		monitorSession: settings.monitorSession,
		revokeAccessTokenOnSignout: settings.revokeAccessTokenOnSignout,
		filterProtocolClaims: settings.filterProtocolClaims,
		loadUserInfo: settings.loadUserInfo,
		extraQueryParams: settings.extraQueryParams,
		acrValues: settings.acr_values
	};
}
