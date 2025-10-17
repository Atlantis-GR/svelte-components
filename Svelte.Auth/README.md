# @atlantis-gr/svelte-auth

OAuth/OIDC authentication library for Svelte applications.

## Features

- OAuth 2.0 / OpenID Connect support
- Automatic token refresh with configurable intervals
- Route guards for protected pages
- Authentication context for component access
- Keycloak integration
- TypeScript support with full type definitions
- Svelte 5 compatibility using runes

## Installation

```bash
npm install @atlantis-gr/svelte-auth
```

## Usage

### 1. Configure Authentication

Create your auth configuration:

```typescript
// app.html or app configuration
const authConfig = {
	authority: 'https://your-keycloak-server.com/realms/your-realm',
	client_id: 'your-client-id',
	redirect_uri: 'http://localhost:5173/auth-callback',
	response_type: 'code',
	scope: 'openid profile email',
	automaticSilentRenew: true,
	silentRequestTimeout: 10000
};
```

### 2. Set Up Authentication Provider

```svelte
<!-- app.html or root layout -->
<script>
	import { AuthProvider } from '@atlantis-gr/svelte-auth/components';

	const authConfig = {
		// your configuration
	};
</script>

<AuthProvider config={authConfig}>
	<slot />
</AuthProvider>
```

### 3. Use Authentication in Components

```svelte
<script>
	import { getAuthStores } from '@atlantis-gr/svelte-auth';

	const { isAuthenticated, user } = getAuthStores();
</script>

{#if $isAuthenticated}
	<p>Welcome, {$user?.profile?.name}!</p>
	<button onclick={logout}>Logout</button>
{:else}
	<button onclick={login}>Login</button>
{/if}
```

### 4. Handle Authentication Callbacks

```svelte
<!-- src/routes/auth-callback/+page.svelte -->
<script>
	import { AuthCallback } from '@atlantis-gr/svelte-auth/components';
</script>

<AuthCallback />
```

## 🔧 API Reference

### Components

#### `<AuthProvider>`

Provides authentication context to child components.

**Props:**

- `config: AuthConfig` - OIDC client configuration
- `onSigninCallback?: (user: User) => void` - Called after successful login
- `onSignoutCallback?: () => void` - Called after logout

#### `<AuthCallback>`

Handles OAuth callback and token exchange.

#### `<AuthRenew>`

Handles silent token renewal.

#### `<LoggedOut>`

Component displayed when user is logged out.

### Stores

#### `getAuthStores()`

Returns reactive stores for authentication state:

```typescript
const {
	isAuthenticated, // Writable<boolean>
	user, // Writable<User | null>
	isLoading // Writable<boolean>
} = getAuthStores();
```

### Services

#### `createScopedLogger(scope: string)`

Creates a scoped logger for debugging:

```typescript
const logger = createScopedLogger('MyComponent');
logger.info('Authentication successful');
```

## 🛡️ Route Protection

### Using Guards

```svelte
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAuthStores } from '@atlantis-gr/svelte-auth';

	const { isAuthenticated } = getAuthStores();

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

<!-- Protected content -->
{#if $isAuthenticated}
	<h1>Protected Page</h1>
{/if}
```

### Automatic Redirects

```typescript
// In your auth configuration
const authConfig = {
	// ... other config
	post_logout_redirect_uri: 'http://localhost:5173/',
	automaticSilentRenew: true
};
```

## 🔑 Identity Provider Setup

### Keycloak Configuration

1. **Create a new client** in your Keycloak realm
2. **Set client type** to "OpenID Connect"
3. **Configure redirect URIs**:
   - `http://localhost:5173/auth-callback` (development)
   - `https://your-domain.com/auth-callback` (production)
4. **Enable required features**:
   - Standard Flow Enabled
   - Direct Access Grants Enabled (if needed)
5. **Set up client scopes** (openid, profile, email)

### Other OIDC Providers

This library works with any OIDC-compliant provider:

- Auth0
- Azure AD
- Google Identity
- Okta
- And more

## ⚙️ Configuration Options

```typescript
interface AuthConfig {
	authority: string; // OIDC provider URL
	client_id: string; // Client identifier
	redirect_uri: string; // Callback URL
	post_logout_redirect_uri?: string;
	response_type?: string; // Usually 'code'
	scope?: string; // Space-separated scopes
	automaticSilentRenew?: boolean;
	silentRequestTimeout?: number;
	loadUserInfo?: boolean;
	clockSkew?: number;
}
```

## 🔍 Debugging

Enable debug logging:

```typescript
import { createScopedLogger } from '@atlantis-gr/svelte-auth';

const logger = createScopedLogger('Auth');
logger.setLevel('debug'); // Enable detailed logging
```

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build the library
npm run build

# Run tests (if available)
npm test
```

## 📚 Examples

See the [sample application](../Svelte.Sample) for complete implementation examples including:

- Login/logout flows
- Protected routes
- Token management
- Error handling
- UI integration patterns

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/your-org/svelte-components/issues)
- 💬 [Discussions](https://github.com/your-org/svelte-components/discussions)
