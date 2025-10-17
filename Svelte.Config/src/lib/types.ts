/**
 * Core application settings interface
 */
export interface AppSettings {
	/** Allow dynamic property access */
	[index: string]: any;

	/** Base API URL for backend services */
	api_url: string;

	/** URL for API documentation */
	api_docs: string;

	/** Authentication configuration settings */
	auth_settings: AuthSettings;

	/** Application culture/locale */
	culture: string;

	/** Whether this is a template application */
	isTemplate: boolean;

	/** Production mode flag */
	production: boolean;

	/** Application version */
	version: string;

	/** Whether the app is being served (runtime flag) */
	isServed: boolean;

	/** Additional environment-specific settings */
	environment?: Record<string, any>;

	/** Feature flags configuration */
	features?: Record<string, boolean>;

	/** Branding and theming configuration */
	branding?: BrandingSettings;

	/** Custom application-specific settings */
	app?: Record<string, any>;
}

/**
 * Authentication settings compatible with Svelte.Auth
 * Similar to ng-config's IAuthSettings but adapted for OIDC client-ts
 */
export interface AuthSettings {
	/** Allow dynamic property access */
	[index: string]: any;

	/** The URL of the OIDC/OAuth2 provider */
	authority: string;

	/** The client identifier */
	client_id: string;

	/** Whether to filter protocol-specific claims from the user profile */
	filterProtocolClaims: boolean;

	/** Whether to load user info from the UserInfo endpoint */
	loadUserInfo: boolean;

	/** The redirect URI after logout */
	post_logout_redirect_uri: string;

	/** The redirect URI for authentication callback */
	redirect_uri: string;

	/** The type of response desired (typically 'code' for auth code flow) */
	response_type: string;

	/** Space-delimited list of requested scopes */
	scope: string;

	/** The redirect URI for silent token renewal */
	silent_redirect_uri: string;

	/** Revoke access token on sign out */
	revokeAccessTokenOnSignout: boolean;

	/** Time in seconds before token expiry to trigger renewal notification */
	accessTokenExpiringNotificationTime: number;

	/** Monitor user session status */
	monitorSession: boolean;

	/** Enable automatic silent token renewal */
	automaticSilentRenew: boolean;

	/** Additional query parameters to pass during authentication */
	extraQueryParams?: Record<string, string>;

	/** ACR values for controlling authentication context */
	acr_values?: string;
}

/**
 * Branding and theming configuration
 */
export interface BrandingSettings {
	/** Application name */
	appName?: string;

	/** Application logo URL */
	appLogo?: string;

	/** Logo alt text */
	appLogoAlt?: string;

	/** Primary brand color */
	primaryColor?: string;

	/** Secondary brand color */
	secondaryColor?: string;

	/** Theme configuration */
	theme?: 'light' | 'dark' | 'auto';

	/** Custom CSS variables */
	cssVariables?: Record<string, string>;
}

/**
 * Configuration for providers and dependencies
 * Similar to ng-config's AppProvidersArray
 */
export interface ConfigProviders {
	/** Array of dependency configurations */
	dependencies?: any[];

	/** URL to the configuration manifest file */
	manifestUrl?: string;

	/** Default configuration values */
	defaults?: Partial<AppSettings>;

	/** Environment-specific overrides */
	environments?: Record<string, Partial<AppSettings>>;

	/** Validation schema for configuration */
	schema?: any;
}

/**
 * Configuration state for reactive stores
 */
export interface ConfigState {
	/** Current application settings */
	settings: AppSettings | null;

	/** Loading state */
	loading: boolean;

	/** Error state */
	error: Error | null;

	/** Whether configuration has been initialized */
	initialized: boolean;

	/** Last update timestamp */
	lastUpdated: Date | null;
}

/**
 * Configuration loading options
 */
export interface ConfigLoadOptions {
	/** URL to fetch configuration from */
	url?: string;

	/** Timeout in milliseconds */
	timeout?: number;

	/** Number of retry attempts */
	retries?: number;

	/** Whether to use cache */
	useCache?: boolean;

	/** Cache key for localStorage */
	cacheKey?: string;

	/** Fallback configuration if loading fails */
	fallback?: Partial<AppSettings>;

	/** Whether to validate configuration against schema */
	validate?: boolean;

	/** Enable periodic reloading of configuration */
	periodicReload?: boolean;

	/** Interval in milliseconds for periodic reloading (default: 300000 = 5 minutes) */
	reloadInterval?: number;

	/** Whether to reload silently without showing loading state */
	silentReload?: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_APP_SETTINGS: Partial<AppSettings> = {
	api_url: '',
	api_docs: '',
	culture: 'en-US',
	isTemplate: false,
	production: false,
	version: '1.0.0',
	isServed: false,
	auth_settings: {
		authority: '',
		client_id: '',
		filterProtocolClaims: true,
		loadUserInfo: false,
		post_logout_redirect_uri: '',
		redirect_uri: '',
		response_type: 'code',
		scope: 'openid profile',
		silent_redirect_uri: '',
		revokeAccessTokenOnSignout: true,
		accessTokenExpiringNotificationTime: 60,
		monitorSession: true,
		automaticSilentRenew: true
	} as AuthSettings,
	features: {},
	branding: {
		theme: 'auto'
	} as BrandingSettings
};

/**
 * Default configuration loading options
 */
export const DEFAULT_CONFIG_OPTIONS: ConfigLoadOptions = {
	url: '/app-settings.manifest.json',
	timeout: 10000,
	retries: 3,
	useCache: true,
	cacheKey: 'app-config',
	validate: false,
	periodicReload: false,
	reloadInterval: 300000, // 5 minutes
	silentReload: true
};

/**
 * Type guard to check if object is AppSettings
 */
export function isAppSettings(obj: any): obj is AppSettings {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.api_url === 'string' &&
		typeof obj.culture === 'string' &&
		typeof obj.production === 'boolean' &&
		typeof obj.version === 'string'
	);
}

/**
 * Type guard to check if object is AuthSettings
 */
export function isAuthSettings(obj: any): obj is AuthSettings {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.authority === 'string' &&
		typeof obj.client_id === 'string' &&
		typeof obj.redirect_uri === 'string'
	);
}
