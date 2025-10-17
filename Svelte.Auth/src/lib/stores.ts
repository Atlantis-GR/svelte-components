import { writable, derived, type Readable } from 'svelte/store';
import type { User } from 'oidc-client-ts';
import type { AuthService } from './auth.service.js';
import type { AuthState, UserProfile } from './types.js';

/**
 * Create authentication stores for Svelte applications
 */
export function createAuthStores(authService: AuthService) {
	// Internal store for the current user
	const userStore = writable<User | null>(null);

	// Internal store for loading state
	const loadingStore = writable<boolean>(true);

	// Internal store for errors
	const errorStore = writable<Error | null>(null);

	// Subscribe to auth service changes
	authService.onUserChange((user) => {
		userStore.set(user);
		loadingStore.set(false);
	});

	authService.onError((error) => {
		errorStore.set(error);
	});

	// Initialize by loading the current user
	authService.loadUser().finally(() => {
		loadingStore.set(false);
	});

	/**
	 * Current authenticated user
	 */
	const user: Readable<User | null> = {
		subscribe: userStore.subscribe
	};

	/**
	 * Whether a user is authenticated
	 */
	const isAuthenticated = derived(userStore, ($user) => {
		return $user !== null && !$user.expired;
	});

	/**
	 * Whether the auth system is loading
	 */
	const isLoading: Readable<boolean> = {
		subscribe: loadingStore.subscribe
	};

	/**
	 * Current error, if any
	 */
	const error: Readable<Error | null> = {
		subscribe: errorStore.subscribe
	};

	/**
	 * User profile from ID token
	 */
	const profile = derived(userStore, ($user) => {
		return ($user?.profile as UserProfile) || null;
	});

	/**
	 * User's email address
	 */
	const email = derived(profile, ($profile) => {
		return $profile?.email;
	});

	/**
	 * User's display name (full name, email, or username)
	 */
	const displayName = derived(profile, ($profile) => {
		if (!$profile) return '';

		const fullName =
			$profile.given_name && $profile.family_name
				? `${$profile.given_name} ${$profile.family_name}`
				: undefined;

		return fullName || $profile.email || $profile.name || '';
	});

	/**
	 * User's roles
	 */
	const roles = derived(profile, ($profile) => {
		if (!$profile) return [];

		const roleClaim = $profile.role;
		if (!roleClaim) return [];

		return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
	});

	/**
	 * Whether the user is an admin
	 */
	const isAdmin = derived([profile, roles], ([$profile, $roles]) => {
		if (!$profile) return false;

		// Check for admin flag
		if ($profile['admin'] === true) return true;

		// Check for Administrator role
		return $roles.includes('Administrator');
	});

	/**
	 * Access token
	 */
	const accessToken = derived(userStore, ($user) => {
		return $user?.access_token || '';
	});

	/**
	 * Authorization header value
	 */
	const authorizationHeader = derived(userStore, ($user) => {
		if ($user) {
			return `${$user.token_type} ${$user.access_token}`;
		}
		return '';
	});

	/**
	 * Combined auth state
	 */
	const authState = derived(
		[userStore, isAuthenticated, loadingStore, errorStore],
		([$user, $isAuthenticated, $isLoading, $error]): AuthState => ({
			user: $user
				? {
						access_token: $user.access_token,
						token_type: $user.token_type,
						profile: $user.profile as UserProfile,
						expires_at: $user.expires_at,
						refresh_token: $user.refresh_token,
						scope: $user.scope,
						session_state: $user.session_state,
						state: $user.state
					}
				: null,
			isAuthenticated: $isAuthenticated,
			isLoading: $isLoading,
			error: $error
		})
	);

	/**
	 * Helper to check if user has a specific role
	 */
	function hasRole(roleName: string): Readable<boolean> {
		return derived(roles, ($roles) => {
			return $roles.includes(roleName);
		});
	}

	/**
	 * Helper to check if user has any of the specified roles
	 */
	function hasAnyRole(...roleNames: string[]): Readable<boolean> {
		return derived(roles, ($roles) => {
			return roleNames.some((role) => $roles.includes(role));
		});
	}

	/**
	 * Helper to check if user has all of the specified roles
	 */
	function hasAllRoles(...roleNames: string[]): Readable<boolean> {
		return derived(roles, ($roles) => {
			return roleNames.every((role) => $roles.includes(role));
		});
	}

	return {
		// Core stores
		user,
		isAuthenticated,
		isLoading,
		error,
		authState,

		// User information stores
		profile,
		email,
		displayName,
		roles,
		isAdmin,

		// Token stores
		accessToken,
		authorizationHeader,

		// Role helpers
		hasRole,
		hasAnyRole,
		hasAllRoles
	};
}

/**
 * Type for the auth stores
 */
export type AuthStores = ReturnType<typeof createAuthStores>;
