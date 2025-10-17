import type { AuthService } from './auth.service.js';
import type { RouteGuardOptions } from './types.js';
import { get } from 'svelte/store';
import type { AuthStores } from './stores.js';
import { getLogger } from './logger.js';

/**
 * Create route guard utilities for protecting Svelte routes
 */
export function createAuthGuards(authService: AuthService, authStores: AuthStores) {
	const logger = getLogger();
	/**
	 * Check if user can activate a route
	 * Returns true if authorized, false otherwise (and redirects to login)
	 */
	async function canActivate(options: RouteGuardOptions = {}): Promise<boolean> {
		const isLoggedIn = await authService.isLoggedIn();

		if (!isLoggedIn) {
			// Store the return URL
			const returnUrl = options.returnUrl || window.location.pathname + window.location.search;

			// Redirect to login
			await authService.signinRedirect({
				location: returnUrl,
				promptRegister: options.promptRegister,
				tenant: options.tenant
			});

			return false;
		}

		// Check role requirements
		if (options.requiredRoles && options.requiredRoles.length > 0) {
			const currentRoles = get(authStores.roles);
			const hasRequiredRole = options.requiredRoles.some((role) => currentRoles.includes(role));

			if (!hasRequiredRole) {
				logger.warn('User does not have required roles:', options.requiredRoles);
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if user has required roles
	 */
	function hasRequiredRoles(requiredRoles: string[]): boolean {
		const currentRoles = get(authStores.roles);
		return requiredRoles.some((role) => currentRoles.includes(role));
	}

	/**
	 * Redirect to login with current location as return URL
	 */
	async function redirectToLogin(options: RouteGuardOptions = {}): Promise<void> {
		const returnUrl = options.returnUrl || window.location.pathname + window.location.search;

		await authService.signinRedirect({
			location: returnUrl,
			promptRegister: options.promptRegister,
			tenant: options.tenant
		});
	}

	/**
	 * Require authentication - throws if not authenticated
	 */
	async function requireAuth(options: RouteGuardOptions = {}): Promise<void> {
		const canAccess = await canActivate(options);
		if (!canAccess) {
			throw new Error('Authentication required');
		}
	}

	return {
		canActivate,
		hasRequiredRoles,
		redirectToLogin,
		requireAuth
	};
}

/**
 * Svelte action for protecting components/routes
 * Usage: <div use:requireAuth={{ requiredRoles: ['Admin'] }}>Protected content</div>
 */
export function createRequireAuthAction(authService: AuthService, authStores: AuthStores) {
	const guards = createAuthGuards(authService, authStores);

	return function requireAuth(node: HTMLElement, options: RouteGuardOptions = {}) {
		let unsubscribe: (() => void) | undefined;

		async function checkAuth() {
			const canAccess = await guards.canActivate(options);

			if (!canAccess) {
				// Hide the element
				node.style.display = 'none';
			} else {
				// Show the element
				node.style.display = '';
			}
		}

		// Check auth immediately
		checkAuth();

		// Re-check when auth state changes
		unsubscribe = authStores.isAuthenticated.subscribe(() => {
			checkAuth();
		});

		return {
			destroy() {
				if (unsubscribe) {
					unsubscribe();
				}
			}
		};
	};
}

/**
 * Helper for SvelteKit load functions
 * Usage in +page.ts or +layout.ts:
 *
 * export const load = async ({ url }) => {
 *   await requireAuthForLoad(authService, { returnUrl: url.pathname });
 *   return {};
 * };
 */
export async function requireAuthForLoad(
	authService: AuthService,
	options: RouteGuardOptions = {}
): Promise<void> {
	const isLoggedIn = await authService.isLoggedIn();

	if (!isLoggedIn) {
		await authService.signinRedirect({
			location: options.returnUrl,
			promptRegister: options.promptRegister,
			tenant: options.tenant
		});

		// Throw to stop further load execution
		throw new Error('Redirecting to login');
	}
}

/**
 * Helper to check authentication status synchronously
 * Useful for checking auth in components
 */
export function isAuthenticatedSync(authStores: AuthStores): boolean {
	return get(authStores.isAuthenticated);
}

/**
 * Helper to get current user synchronously
 */
export function getCurrentUserSync(authStores: AuthStores) {
	return get(authStores.user);
}

/**
 * Helper to check if user has a specific role synchronously
 */
export function hasRoleSync(authStores: AuthStores, roleName: string): boolean {
	const roles = get(authStores.roles);
	return roles.includes(roleName);
}

/**
 * Helper to check if user has any of the specified roles synchronously
 */
export function hasAnyRoleSync(authStores: AuthStores, ...roleNames: string[]): boolean {
	const roles = get(authStores.roles);
	return roleNames.some((role) => roles.includes(role));
}

/**
 * Helper to check if user has all of the specified roles synchronously
 */
export function hasAllRolesSync(authStores: AuthStores, ...roleNames: string[]): boolean {
	const roles = get(authStores.roles);
	return roleNames.every((role) => roles.includes(role));
}
