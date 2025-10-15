// Core types
export type {
  AppSettings,
  AuthSettings,
  BrandingSettings,
  ConfigState,
  ConfigLoadOptions,
  ConfigProviders
} from './types.js';

export {
  DEFAULT_APP_SETTINGS,
  DEFAULT_CONFIG_OPTIONS,
  isAppSettings,
  isAuthSettings
} from './types.js';

// Stores
export {
  config,
  configLoading,
  configError,
  configInitialized,
  configLastUpdated,
  authSettings,
  brandingSettings,
  featureFlags,
  apiUrl,
  isProduction,
  culture,
  appVersion,
  configActions,
  configGetters,
  createConfigSection,
  createConfigPath,
  createFeatureFlag,
  environmentConfig,
  onConfigChange
} from './stores.js';

// Services
export {
  ConfigService,
  ConfigInitializer,
  createConfigService,
  initializeConfig,
  defaultConfigService
} from './service.js';

// Context
export type { ConfigContext } from './context.js';
export {
  initConfig,
  getConfig,
  getConfigService,
  getConfigStores,
  getConfigActions,
  getConfigGetters,
  loadAppConfig,
  configUtils,
  useConfig,
  createConfigScope,
  isConfigInitialized,
  waitForConfig,
  preloadConfig
} from './context.js';

// Components
export * as components from './components/index.js';

// Auth integration
export type { AuthConfigAccessor } from './auth-integration.js';
export {
  getAuthConfig,
  createAuthProvider,
  watchAuthSettings,
  getAuthSetting,
  isAuthConfigured,
  validateAuthConfig,
  createAuthSettings,
  getResolvedAuthSettings,
  authUtils,
  getTypedAuthConfig
} from './auth-integration.js';

// Logging
export {
  configureConfigLogger,
  getConfigLogger,
  createConfigScopedLogger
} from './logger.js';