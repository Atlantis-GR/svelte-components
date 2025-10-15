# @atlantis-gr/svelte-config

Runtime configuration management for SvelteKit applications with dynamic settings and feature flags.

## Features

- Runtime configuration loading from multiple sources
- Feature flags with real-time updates
- Environment-specific configurations
- Type-safe configuration access
- Debug tools for configuration inspection
- Secure configuration handling
- Browser and server compatibility

## Installation

```bash
npm install @atlantis-gr/svelte-config
```

## Usage

### 1. Create Configuration Manifest

Create a configuration file in your `static/` directory:

```json
// static/app-settings.manifest.json
{
  "api": {
    "url": "http://localhost:3001",
    "timeout": 10000,
    "retries": 3
  },
  "features": {
    "enableDarkMode": true,
    "enableBetaFeatures": false,
    "enableAdvancedLogging": false
  },
  "branding": {
    "appName": "My Application",
    "primaryColor": "#ff3e00",
    "theme": "auto"
  },
  "environment": {
    "development": {
      "api_url": "http://localhost:3001",
      "debug": true
    },
    "production": {
      "api_url": "https://api.production.com",
      "debug": false
    }
  }
}
```

### 2. Set Up Configuration Provider

```svelte
<!-- app.html or root layout -->
<script>
  import { ConfigProvider } from '@atlantis-gr/svelte-config/components';
</script>

<ConfigProvider configUrl="/app-settings.manifest.json">
  <slot />
</ConfigProvider>
```

### 3. Use Configuration in Components

```svelte
<script>
  import { useConfig } from '@atlantis-gr/svelte-config';
  import { FeatureFlag, ConfigValue } from '@atlantis-gr/svelte-config/components';
  
  const { config, featureFlags, apiUrl } = useConfig();
</script>

<!-- Access configuration values -->
<p>API URL: {$apiUrl}</p>

<!-- Use feature flags -->
<FeatureFlag flag="enableDarkMode">
  <button>Toggle Dark Mode</button>
</FeatureFlag>

<!-- Display configuration values -->
<ConfigValue key="branding.appName" fallback="Default App" />

<!-- Debug configuration -->
{#if $config.environment?.debug}
  <pre>{JSON.stringify($config, null, 2)}</pre>
{/if}
```

## 🔧 API Reference

### Components

#### `<ConfigProvider>`
Provides configuration context to child components.

**Props:**
- `configUrl: string` - URL to configuration manifest
- `fallbackConfig?: object` - Default configuration if loading fails
- `onConfigLoaded?: (config: any) => void` - Callback when config loads
- `onConfigError?: (error: Error) => void` - Callback on loading errors

#### `<FeatureFlag>`
Conditionally renders content based on feature flag state.

**Props:**
- `flag: string` - Feature flag key (supports dot notation)
- `fallback?: boolean` - Default value if flag not found

```svelte
<FeatureFlag flag="features.enableBetaFeatures">
  <p>Beta features are enabled!</p>
</FeatureFlag>
```

#### `<ConfigValue>`
Displays configuration values with optional formatting.

**Props:**
- `key: string` - Configuration key (supports dot notation)
- `fallback?: any` - Default value if key not found
- `format?: (value: any) => string` - Custom formatter function

#### `<ConfigDebugger>`
Development tool for inspecting configuration state.

**Props:**
- `showJson?: boolean` - Display raw JSON (default: true)
- `showFeatureFlags?: boolean` - Show feature flags separately (default: true)

### Composables

#### `useConfig()`
Returns reactive stores for configuration access:

```typescript
const {
  config,           // Writable<ConfigObject>
  featureFlags,     // Writable<FeatureFlags>
  apiUrl,          // Writable<string>
  isProduction,    // Writable<boolean>
  culture,         // Writable<string>
  appVersion,      // Writable<string>
  service          // ConfigService instance
} = useConfig();
```

### Services

#### `ConfigService`
Core configuration management service:

```typescript
import { ConfigService } from '@atlantis-gr/svelte-config';

const configService = new ConfigService();

// Load configuration
await configService.loadConfig('/config.json');

// Get configuration value
const apiUrl = configService.get('api.url');

// Update configuration
configService.update({
  features: {
    enableBetaFeatures: true
  }
});

// Subscribe to changes
configService.subscribe((config) => {
  console.log('Config updated:', config);
});
```

## ⚙️ Configuration Structure

### Standard Configuration Format

```typescript
interface AppConfig {
  api?: {
    url?: string;
    timeout?: number;
    retries?: number;
  };
  features?: Record<string, boolean>;
  branding?: {
    appName?: string;
    primaryColor?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  environment?: {
    [env: string]: Record<string, any>;
  };
  app?: {
    version?: string;
    culture?: string;
    title?: string;
    description?: string;
  };
}
```

### Environment-Specific Configuration

```json
{
  "environment": {
    "development": {
      "api_url": "http://localhost:3001",
      "debug": true,
      "features": {
        "enableDebugMode": true
      }
    },
    "staging": {
      "api_url": "https://staging-api.example.com",
      "debug": false
    },
    "production": {
      "api_url": "https://api.example.com",
      "debug": false,
      "features": {
        "enableDebugMode": false
      }
    }
  }
}
```

## 🔒 Security Considerations

### Secure Configuration Values

For sensitive configuration values, use server-side APIs:

```svelte
<script>
  import { onMount } from 'svelte';
  import { useConfig } from '@atlantis-gr/svelte-config';
  
  const { service } = useConfig();
  
  onMount(async () => {
    // Load secure configuration from API
    const secureConfig = await fetch('/api/config/secure').then(r => r.json());
    service.update(secureConfig);
  });
</script>
```

### Environment Variables

Never expose sensitive data in client-side configuration:

```json
// ✅ Good - Public configuration
{
  "api": {
    "url": "https://api.example.com"
  }
}

// ❌ Bad - Sensitive data
{
  "api": {
    "secret": "secret-api-key"  // Don't do this!
  }
}
```

## 🎨 Styling and Themes

### Theme Configuration

```json
{
  "branding": {
    "theme": "auto",
    "primaryColor": "#ff3e00",
    "secondaryColor": "#676778",
    "cssVariables": {
      "--primary-color": "#ff3e00",
      "--secondary-color": "#676778"
    }
  }
}
```

### Using Theme Values

```svelte
<script>
  import { useConfig } from '@atlantis-gr/svelte-config';
  
  const { config } = useConfig();
  
  $: primaryColor = $config.branding?.primaryColor || '#000000';
</script>

<style>
  .themed-button {
    background-color: var(--primary-color, {primaryColor});
  }
</style>
```

## 🔄 Dynamic Updates

### Updating Configuration at Runtime

```typescript
import { useConfig } from '@atlantis-gr/svelte-config';

const { service } = useConfig();

// Update feature flags
function toggleFeature(flagName: string) {
  service.update({
    features: {
      [flagName]: !service.get(`features.${flagName}`)
    }
  });
}

// Batch updates
function updateMultipleSettings(updates: Partial<AppConfig>) {
  service.update(updates);
}
```

### Server-Side Configuration Updates

```typescript
// API endpoint for configuration updates
async function updateConfigFromServer() {
  const response = await fetch('/api/config', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const serverConfig = await response.json();
  service.update(serverConfig);
}
```

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build the library
npm run build

# Format code
npm run format
```

### Testing Configuration Components

```typescript
import { render } from '@testing-library/svelte';
import { ConfigProvider, FeatureFlag } from '@atlantis-gr/svelte-config/components';

test('feature flag renders when enabled', () => {
  const config = {
    features: { myFeature: true }
  };
  
  const { getByText } = render(FeatureFlag, {
    props: { flag: 'features.myFeature' },
    context: new Map([['config', config]])
  });
  
  // Test implementation
});
```

## 📚 Examples

See the [sample application](../Svelte.Sample) for complete examples including:

- Configuration loading and display
- Feature flag implementations
- Environment-specific settings
- Debug tools usage
- Runtime configuration updates

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/your-org/svelte-components/issues)
- 💬 [Discussions](https://github.com/your-org/svelte-components/discussions)