/**
 * Example configuration for different authentication scenarios
 */

import type { AuthSettings } from './types.js';

/**
 * Development configuration with local IdentityServer
 */
export const devAuthSettings: AuthSettings = {
  authority: 'http://localhost:5000',
  client_id: 'my-svelte-app-dev',
  redirect_uri: 'http://localhost:5173/auth-callback',
  post_logout_redirect_uri: 'http://localhost:5173/logged-out',
  silent_redirect_uri: 'http://localhost:5173/auth-renew',
  response_type: 'code',
  scope: 'openid profile email',
  filterProtocolClaims: true,
  loadUserInfo: true,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTime: 60,
  monitorSession: true,
  revokeAccessTokenOnSignout: true
};

/**
 * Production configuration with Azure AD B2C
 */
export const azureB2CAuthSettings: AuthSettings = {
  authority: 'https://yourtenantname.b2clogin.com/yourtenantname.onmicrosoft.com/B2C_1_signupsignin',
  client_id: 'your-azure-client-id',
  redirect_uri: 'https://yourapp.com/auth-callback',
  post_logout_redirect_uri: 'https://yourapp.com/logged-out',
  silent_redirect_uri: 'https://yourapp.com/auth-renew',
  response_type: 'code',
  scope: 'openid profile email https://yourtenantname.onmicrosoft.com/api/user_impersonation',
  automaticSilentRenew: true,
  useRefreshToken: true,
  revokeAccessTokenOnSignout: true
};

/**
 * Auth0 configuration
 */
export const auth0Settings: AuthSettings = {
  authority: 'https://your-tenant.auth0.com',
  client_id: 'your-auth0-client-id',
  redirect_uri: 'https://yourapp.com/auth-callback',
  post_logout_redirect_uri: 'https://yourapp.com/logged-out',
  silent_redirect_uri: 'https://yourapp.com/auth-renew',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  useRefreshToken: true
};

/**
 * Keycloak configuration
 */
export const keycloakSettings: AuthSettings = {
  authority: 'https://your-keycloak-server.com/realms/your-realm',
  client_id: 'your-keycloak-client',
  redirect_uri: 'https://yourapp.com/auth-callback',
  post_logout_redirect_uri: 'https://yourapp.com/logged-out',
  silent_redirect_uri: 'https://yourapp.com/auth-renew',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true
};

/**
 * IdentityServer4 configuration
 */
export const identityServer4Settings: AuthSettings = {
  authority: 'https://your-identity-server.com',
  client_id: 'your-client-id',
  redirect_uri: 'https://yourapp.com/auth-callback',
  post_logout_redirect_uri: 'https://yourapp.com/logged-out',
  silent_redirect_uri: 'https://yourapp.com/auth-renew',
  response_type: 'code',
  scope: 'openid profile email api',
  filterProtocolClaims: true,
  loadUserInfo: false,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTime: 60,
  monitorSession: true,
  useRefreshToken: true,
  revokeAccessTokenOnSignout: true
};

/**
 * Multi-tenant configuration example
 */
export function createMultiTenantSettings(
  tenantId: string,
  baseAuthority: string
): AuthSettings {
  return {
    authority: `${baseAuthority}/${tenantId}`,
    client_id: 'multi-tenant-app',
    redirect_uri: `https://yourapp.com/auth-callback`,
    post_logout_redirect_uri: `https://yourapp.com/logged-out`,
    silent_redirect_uri: `https://yourapp.com/auth-renew`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    acr_values: `tenant:${tenantId}`
  };
}
