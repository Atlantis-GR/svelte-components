import type { AuthService } from './auth.service.js';
import type { InterceptorConfig } from './types.js';
import { getLogger } from './logger.js';

/**
 * Create an authenticated fetch wrapper that automatically adds auth headers
 */
export function createAuthFetch(authService: AuthService, config: InterceptorConfig = {}) {
	const logger = getLogger();
	const { apiBaseUrl, additionalUrls = [], excludeUrls = [], onUnauthorized, onForbidden } = config;

	/**
	 * Check if a URL should have auth headers added
	 */
	function shouldAddAuthHeader(url: string): boolean {
		// Skip i18n/translation files
		if (url.includes('i18n') || url.includes('/locales/')) {
			return false;
		}

		// Check exclude list
		if (excludeUrls.some((excludeUrl) => url.includes(excludeUrl))) {
			return false;
		}

		// If apiBaseUrl is set, only add auth to matching URLs
		if (apiBaseUrl) {
			if (url.startsWith(apiBaseUrl)) {
				return true;
			}
		}

		// Check additional URLs
		if (additionalUrls.some((addUrl) => url.startsWith(addUrl))) {
			return true;
		}

		// If no apiBaseUrl is set, add auth to all non-excluded URLs
		if (!apiBaseUrl && additionalUrls.length === 0) {
			return true;
		}

		return false;
	}

	/**
	 * Enhanced fetch function with authentication
	 */
	async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		const url =
			typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

		// Clone init to avoid modifying original
		const requestInit: RequestInit = { ...init };

		// Add auth header if needed
		if (shouldAddAuthHeader(url)) {
			const authHeader = authService.getAuthorizationHeaderValue();
			if (authHeader) {
				requestInit.headers = {
					...requestInit.headers,
					Authorization: authHeader
				};
			}
		}

		try {
			const response = await fetch(input, requestInit);

			// Handle 401 Unauthorized
			if (response.status === 401) {
				logger.warn('Unauthorized request (401) - removing user and redirecting to login');

				// Remove user and redirect to login
				await authService.removeUser();
				await authService.signoutRedirect();

				// Call custom handler if provided
				if (onUnauthorized) {
					onUnauthorized();
				}
			}

			// Handle 403 Forbidden
			if (response.status === 403) {
				logger.warn('Forbidden request (403)');

				// Call custom handler if provided
				if (onForbidden) {
					onForbidden();
				}
			}

			return response;
		} catch (error) {
			logger.error('Fetch error:', error);
			throw error;
		}
	}

	return authFetch;
}

/**
 * Create an auth fetch wrapper with JSON helpers
 */
export function createAuthApi(authService: AuthService, config: InterceptorConfig = {}) {
	const authFetch = createAuthFetch(authService, config);

	/**
	 * Perform GET request and parse JSON
	 */
	async function get<T = any>(url: string, init?: RequestInit): Promise<T> {
		const response = await authFetch(url, {
			...init,
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	/**
	 * Perform POST request with JSON body
	 */
	async function post<T = any>(url: string, data?: any, init?: RequestInit): Promise<T> {
		const response = await authFetch(url, {
			...init,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...init?.headers
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	/**
	 * Perform PUT request with JSON body
	 */
	async function put<T = any>(url: string, data?: any, init?: RequestInit): Promise<T> {
		const response = await authFetch(url, {
			...init,
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...init?.headers
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	/**
	 * Perform PATCH request with JSON body
	 */
	async function patch<T = any>(url: string, data?: any, init?: RequestInit): Promise<T> {
		const response = await authFetch(url, {
			...init,
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...init?.headers
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	/**
	 * Perform DELETE request
	 */
	async function del<T = any>(url: string, init?: RequestInit): Promise<T> {
		const response = await authFetch(url, {
			...init,
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// DELETE might not return content
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}

		return undefined as T;
	}

	return {
		fetch: authFetch,
		get,
		post,
		put,
		patch,
		delete: del
	};
}
