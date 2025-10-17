// Core
export { AuthService } from './auth.service.js';
export { createAuthStores, type AuthStores } from './stores.js';
export { createAuthFetch, createAuthApi } from './interceptor.js';
export {
	createAuthGuards,
	createRequireAuthAction,
	requireAuthForLoad,
	isAuthenticatedSync,
	getCurrentUserSync,
	hasRoleSync,
	hasAnyRoleSync,
	hasAllRolesSync
} from './guards.js';

// Logging
export {
	configureLogger,
	getLogger,
	createScopedLogger,
	ConsoleLogger,
	SilentLogger,
	LogLevel,
	type ILogger,
	type LoggerConfig
} from './logger.js';

// Context
export {
	initAuth,
	getAuth,
	getAuthService,
	getAuthStores,
	getAuthFetch,
	getAuthApi,
	getAuthGuards,
	type AuthContext
} from './context.js';

// Components - re-export component entry for convenience
export * as components from './components/index.js';

export type {
	AuthSettings,
	SignInRedirectOptions,
	UserProfile,
	AuthUser,
	AuthState,
	RouteGuardOptions,
	InterceptorConfig
} from './types.js';

export {
	defaultAuthSettings,
	demoAuthSettings,
	createAuth0Settings,
	createAzureAdSettings,
	createKeycloakSettings
} from './types.js';

// Export examples
export * from './examples.js';
