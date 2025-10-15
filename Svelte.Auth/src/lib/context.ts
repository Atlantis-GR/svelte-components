import { getContext, setContext } from 'svelte';
import { AuthService } from './auth.service.js';
import { createAuthStores, type AuthStores } from './stores.js';
import { createAuthFetch, createAuthApi } from './interceptor.js';
import { createAuthGuards, createRequireAuthAction } from './guards.js';
import type { AuthSettings, InterceptorConfig } from './types.js';

const AUTH_CONTEXT_KEY = Symbol('auth');

/**
 * Complete authentication context
 */
export interface AuthContext {
  service: AuthService;
  stores: AuthStores;
  fetch: ReturnType<typeof createAuthFetch>;
  api: ReturnType<typeof createAuthApi>;
  guards: ReturnType<typeof createAuthGuards>;
  requireAuth: ReturnType<typeof createRequireAuthAction>;
}

/**
 * Initialize authentication and set context
 * Call this in your root layout or app component
 */
export function initAuth(
  authSettings: AuthSettings,
  interceptorConfig?: InterceptorConfig
): AuthContext {
  // Create auth service
  const service = new AuthService(authSettings);

  // Create stores
  const stores = createAuthStores(service);

  // Create fetch utilities
  const fetch = createAuthFetch(service, interceptorConfig);
  const api = createAuthApi(service, interceptorConfig);

  // Create guards
  const guards = createAuthGuards(service, stores);
  const requireAuth = createRequireAuthAction(service, stores);

  const context: AuthContext = {
    service,
    stores,
    fetch,
    api,
    guards,
    requireAuth
  };

  // Set context for child components
  setContext(AUTH_CONTEXT_KEY, context);

  return context;
}

/**
 * Get authentication context
 * Use this in child components to access auth
 */
export function getAuth(): AuthContext {
  const context = getContext<AuthContext>(AUTH_CONTEXT_KEY);
  if (!context) {
    throw new Error('Auth context not found. Did you call initAuth() in a parent component?');
  }
  return context;
}

/**
 * Get auth service from context
 */
export function getAuthService(): AuthService {
  return getAuth().service;
}

/**
 * Get auth stores from context
 */
export function getAuthStores(): AuthStores {
  return getAuth().stores;
}

/**
 * Get authenticated fetch from context
 */
export function getAuthFetch() {
  return getAuth().fetch;
}

/**
 * Get authenticated API from context
 */
export function getAuthApi() {
  return getAuth().api;
}

/**
 * Get auth guards from context
 */
export function getAuthGuards() {
  return getAuth().guards;
}
