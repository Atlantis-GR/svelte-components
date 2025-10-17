# Svelte Sample Application

Demonstration application showcasing the Svelte Components Library.

## Overview

This sample application demonstrates the integration and usage of the component library:

- @atlantis-gr/svelte-auth - OAuth authentication flows
- @atlantis-gr/svelte-config - Runtime configuration management
- @atlantis-gr/svelte-logging-abstractions - Structured logging
- Post editor with markdown support
- Responsive design with Tailwind CSS

## Features

### Authentication

- OAuth/OIDC login with Keycloak
- Automatic token refresh
- Protected routes and components
- User profile management

### Configuration Management

- Runtime configuration loading
- Feature flags with real-time updates
- Environment-specific settings
- Configuration debugging tools

### Content Management

- Post editor with markdown support
- Real-time preview functionality
- Word count and reading time statistics
- Category and tag management

### User Interface

- Responsive design with Tailwind CSS
- Mobile-first approach
- Accessible components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Running [Sample API Server](../Svelte.Sample.Api)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment (if needed):**

   ```bash
   # Copy example configuration
   cp static/app-settings.example.json static/app-settings.manifest.json
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open application:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── routes/                 # SvelteKit routes
│   ├── +layout.svelte     # Root layout with providers
│   ├── +page.svelte       # Home page
│   ├── auth-callback/     # OAuth callback handling
│   ├── auth-renew/        # Token renewal handling
│   ├── dashboard/         # User dashboard
│   ├── posts/             # Blog/CMS functionality
│   │   ├── +page.svelte   # Posts list
│   │   ├── create/        # Post creation
│   │   └── [id]/          # Individual post pages
│   ├── config-demo/       # Configuration examples
│   ├── api-demo/          # API integration demo
│   └── logger-example/    # Logging examples
├── lib/                   # Shared utilities
│   ├── api-client.ts      # API communication
│   ├── AuthDebug.svelte   # Auth debugging component
│   └── config-helpers.ts  # Configuration utilities
└── static/               # Static assets
    └── app-settings.manifest.json  # App configuration
```

## 🔧 Configuration

### Application Settings

The app uses a configuration manifest for runtime settings:

```json
{
	"api": {
		"url": "http://localhost:3001",
		"timeout": 10000
	},
	"features": {
		"enableDarkMode": true,
		"enableBetaFeatures": false,
		"enableAdvancedLogging": false,
		"enableConfigDebugger": true
	},
	"branding": {
		"appName": "Svelte Components Demo",
		"primaryColor": "#ff3e00",
		"theme": "auto"
	},
	"auth_settings": {
		"authority": "https://your-keycloak-server.com/realms/your-realm",
		"client_id": "your-client-id",
		"redirect_uri": "http://localhost:5173/auth-callback",
		"response_type": "code",
		"scope": "openid profile email"
	}
}
```

### Authentication Setup

1. **Configure Keycloak** (or other OIDC provider)
2. **Update auth settings** in configuration manifest
3. **Set redirect URIs** in your identity provider
4. **Test authentication flow**

## 📱 Application Features

### Dashboard

- User authentication status
- System health monitoring
- Quick access to features
- Configuration overview

### Posts Management

The advanced post editor includes:

#### ✍️ Rich Text Editor

- Markdown toolbar with formatting options
- Bold, italic, headers, links, images
- Code blocks, quotes, and lists
- Live preview mode

#### 📊 Content Analytics

- Real-time word count
- Estimated reading time
- Writing statistics
- Content validation

#### 🔍 SEO Optimization

- Custom meta titles and descriptions
- Auto-generated SEO fields
- Content optimization hints
- Social media previews

#### 🏷️ Content Organization

- Category management
- Tag system
- Featured images
- Content scheduling

### API Integration

Demonstrates complete API integration:

- Authentication headers
- Error handling
- Loading states
- Pagination
- Real-time updates

### Configuration Demo

Shows configuration management:

- Feature flag toggling
- Runtime configuration updates
- Environment-specific settings
- Configuration debugging

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Code formatting
npm run format

# Linting
npm run lint
```

### Development Workflow

1. **Start the API server** (see [API documentation](../Svelte.Sample.Api))
2. **Run the development server**
3. **Make changes** and see hot reloading
4. **Test authentication** with your OIDC provider
5. **Verify configuration** updates work correctly

### Adding New Features

1. **Create new routes** in `src/routes/`
2. **Use authentication** context where needed
3. **Access configuration** via `useConfig()`
4. **Add logging** with scoped loggers
5. **Update navigation** in layout components

## 🧪 Testing

### Manual Testing Checklist

- [ ] Authentication login/logout flow
- [ ] Protected route access
- [ ] Configuration loading and updates
- [ ] Feature flag toggling
- [ ] Post creation and editing
- [ ] Markdown rendering
- [ ] API error handling
- [ ] Responsive design on mobile

### E2E Testing

```bash
# Install Playwright (if configured)
npm install @playwright/test

# Run E2E tests
npm run test:e2e
```

## 🎨 Customization

### Styling

The app uses Tailwind CSS for styling:

```css
/* app.css - Custom styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
.prose {
	@apply text-gray-700 dark:text-gray-300;
}
```

### Theming

Configure themes via the configuration manifest:

```json
{
	"branding": {
		"theme": "auto",
		"primaryColor": "#your-color",
		"cssVariables": {
			"--primary-color": "#your-color"
		}
	}
}
```

### Components

Extend existing components or create new ones:

```svelte
<script>
	import { useConfig } from '@atlantis-gr/svelte-config';
	import { createScopedLogger } from '@atlantis-gr/svelte-auth';

	const { config } = useConfig();
	const logger = createScopedLogger('CustomComponent');
</script>
```

## 📚 Learning Resources

### Key Concepts Demonstrated

1. **Authentication Patterns**
   - OAuth/OIDC integration
   - Token management
   - Route protection
   - User context

2. **Configuration Management**
   - Runtime configuration
   - Feature flags
   - Environment handling
   - Secure configuration

3. **Svelte Patterns**
   - Svelte 5 runes
   - Component composition
   - Store management
   - Lifecycle handling

4. **API Integration**
   - HTTP client patterns
   - Error handling
   - Loading states
   - Authentication headers

## Integration Examples

### Custom API Client

```typescript
// lib/custom-api.ts
import { setAuthToken } from './api-client.js';
import { getAuthStores } from '@atlantis-gr/svelte-auth';

const { user } = getAuthStores();

user.subscribe((currentUser) => {
	if (currentUser?.access_token) {
		setAuthToken(currentUser.access_token);
	}
});
```

### Configuration-Driven Features

```svelte
<script>
	import { FeatureFlag } from '@atlantis-gr/svelte-config/components';
</script>

<FeatureFlag flag="features.enableAdvancedEditor">
	<AdvancedPostEditor />
</FeatureFlag>

<FeatureFlag flag="features.enableBasicEditor" fallback={true}>
	<BasicPostEditor />
</FeatureFlag>
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
