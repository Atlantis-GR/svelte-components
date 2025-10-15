/**
 * OAuth/OIDC Authentication settings configuration
 */
export interface AuthSettings {
  /** The URL of the OIDC/OAuth2 provider */
  authority: string;
  
  /** The client identifier */
  client_id: string;
  
  /** The redirect URI for authentication callback */
  redirect_uri: string;
  
  /** The redirect URI after logout */
  post_logout_redirect_uri: string;
  
  /** The type of response desired (typically 'code' for auth code flow) */
  response_type: string;
  
  /** Space-delimited list of requested scopes */
  scope: string;
  
  /** Whether to filter protocol-specific claims from the user profile */
  filterProtocolClaims?: boolean;
  
  /** Whether to load user info from the UserInfo endpoint */
  loadUserInfo?: boolean;
  
  /** The redirect URI for silent token renewal */
  silent_redirect_uri?: string;
  
  /** Additional query parameters to pass during authentication */
  extraQueryParams?: Record<string, string>;
  
  /** ACR values for controlling authentication context */
  acr_values?: string;
  
  /** Enable automatic silent token renewal */
  automaticSilentRenew?: boolean;
  
  /** Time in seconds before token expiry to trigger renewal notification */
  accessTokenExpiringNotificationTime?: number;
  
  /** Monitor user session status */
  monitorSession?: boolean;
  
  /** Revoke access token on sign out */
  revokeAccessTokenOnSignout?: boolean;
  
  /** Use refresh tokens for token renewal */
  useRefreshToken?: boolean;
}

/**
 * Default authentication settings
 */
export const defaultAuthSettings: Partial<AuthSettings> = {
  response_type: 'code',
  scope: 'openid profile email',
  filterProtocolClaims: true,
  loadUserInfo: false,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTime: 60,
  monitorSession: true,
  revokeAccessTokenOnSignout: true,
  useRefreshToken: true,
  extraQueryParams: {}
};

/**
 * Demo/development authentication settings for quick testing
 * Uses public demo identity server - replace with your provider in production
 */
export const demoAuthSettings: AuthSettings = {
  authority: 'https://demo.duendesoftware.com',
  client_id: 'interactive.public',
  redirect_uri: 'http://localhost:5173/auth-callback',
  silent_redirect_uri: 'http://localhost:5173/auth-renew',
  post_logout_redirect_uri: 'http://localhost:5173/logged-out',
  response_type: 'code',
  scope: 'openid profile email api',
  automaticSilentRenew: true,
  loadUserInfo: true
};

/**
 * Creates Auth0 settings template
 */
export function createAuth0Settings(domain: string, clientId: string, baseUrl = 'http://localhost:5173'): AuthSettings {
  return {
    authority: `https://${domain}`,
    client_id: clientId,
    redirect_uri: `${baseUrl}/auth-callback`,
    silent_redirect_uri: `${baseUrl}/auth-renew`,
    post_logout_redirect_uri: `${baseUrl}/logged-out`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    loadUserInfo: true
  };
}

/**
 * Creates Azure AD settings template
 */
export function createAzureAdSettings(tenantId: string, clientId: string, baseUrl = 'http://localhost:5173'): AuthSettings {
  return {
    authority: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    client_id: clientId,
    redirect_uri: `${baseUrl}/auth-callback`,
    silent_redirect_uri: `${baseUrl}/auth-renew`,
    post_logout_redirect_uri: `${baseUrl}/logged-out`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    loadUserInfo: false
  };
}

/**
 * Creates Keycloak settings template
 */
export function createKeycloakSettings(
  keycloakUrl: string, 
  realm: string, 
  clientId: string, 
  baseUrl = 'http://localhost:5173'
): AuthSettings {
  return {
    authority: `${keycloakUrl}/realms/${realm}`,
    client_id: clientId,
    redirect_uri: `${baseUrl}/auth-callback`,
    silent_redirect_uri: `${baseUrl}/auth-renew`,
    post_logout_redirect_uri: `${baseUrl}/logged-out`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    loadUserInfo: true,
    // Keycloak specific settings
    filterProtocolClaims: true,
    useRefreshToken: true,
    revokeAccessTokenOnSignout: true
  };
}

/**
 * Options for sign-in redirect
 */
export interface SignInRedirectOptions {
  /** The URL to redirect to after successful authentication */
  location?: string;
  
  /** Whether to prompt the user for registration instead of login */
  promptRegister?: boolean;
  
  /** Tenant identifier for multi-tenant applications */
  tenant?: string;
}

/**
 * User profile claims from ID token
 */
export interface UserProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  picture?: string;
  role?: string | string[];
  [key: string]: any;
}

/**
 * Extended user information
 */
export interface AuthUser {
  access_token: string;
  token_type: string;
  profile: UserProfile;
  expires_at?: number;
  refresh_token?: string;
  scope?: string;
  session_state?: string | null;
  state?: any;
}

/**
 * Authentication state
 */
export interface AuthState {
  /** Current authenticated user */
  user: AuthUser | null;
  
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether the auth system is loading/initializing */
  isLoading: boolean;
  
  /** Any authentication error */
  error: Error | null;
}

/**
 * Route protection options
 */
export interface RouteGuardOptions {
  /** Redirect URL after successful authentication */
  returnUrl?: string;
  
  /** Required roles for access */
  requiredRoles?: string[];
  
  /** Whether to prompt for registration */
  promptRegister?: boolean;
  
  /** Tenant context */
  tenant?: string;
}

/**
 * HTTP interceptor configuration
 */
export interface InterceptorConfig {
  /** Base URL of the API to add auth headers to */
  apiBaseUrl?: string;
  
  /** Additional URLs to add auth headers to */
  additionalUrls?: string[];
  
  /** URLs to exclude from authentication */
  excludeUrls?: string[];
  
  /** Custom error handler for 401/403 responses */
  onUnauthorized?: () => void;
  
  /** Custom error handler for 403 responses */
  onForbidden?: () => void;
}
