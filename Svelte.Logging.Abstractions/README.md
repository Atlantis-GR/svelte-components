# @atlantis-gr/svelte-logging-abstractions

Flexible logging abstractions for Svelte applications with structured logging support.

## Features

- Multiple log levels (debug, info, warn, error)
- Scoped loggers for component-specific logging
- Custom formatters for different output formats
- Browser and server compatibility
- Structured logging with metadata support
- TypeScript support with full type definitions

## Installation

```bash
npm install @atlantis-gr/svelte-logging-abstractions
```

## Usage

### 1. Create a Logger

```typescript
import { createScopedLogger } from '@atlantis-gr/svelte-logging-abstractions';

const logger = createScopedLogger('MyComponent');

logger.info('Component initialized');
logger.warn('Deprecation warning', { component: 'MyComponent' });
logger.error('An error occurred', { error: 'Details here' });
```

### 2. Use in Svelte Components

```svelte
<script>
  import { createScopedLogger } from '@atlantis-gr/svelte-logging-abstractions';
  import { onMount } from 'svelte';
  
  const logger = createScopedLogger('UserProfile');
  
  onMount(() => {
    logger.info('UserProfile component mounted');
  });
  
  function handleUserUpdate() {
    try {
      // Update user logic
      logger.info('User profile updated successfully');
    } catch (error) {
      logger.error('Failed to update user profile', { error });
    }
  }
</script>
```

### 3. Configure Logging Levels

```typescript
import { getLogger, LogLevel } from '@atlantis-gr/svelte-logging-abstractions';

// Set global log level
const rootLogger = getLogger();
rootLogger.setLevel(LogLevel.DEBUG);

// Set specific logger level
const apiLogger = createScopedLogger('API');
apiLogger.setLevel(LogLevel.WARN); // Only warn and error messages
```

## 🔧 API Reference

### Core Functions

#### `createScopedLogger(scope: string)`
Creates a scoped logger with the specified scope name.

```typescript
const logger = createScopedLogger('AuthService');
logger.info('User authenticated'); // [AuthService] User authenticated
```

#### `getLogger()`
Returns the root logger instance.

```typescript
const rootLogger = getLogger();
rootLogger.setLevel(LogLevel.DEBUG);
```

### Logger Interface

```typescript
interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
```

### Usage Examples

#### Basic Logging

```typescript
const logger = createScopedLogger('DataService');

// Simple messages
logger.debug('Fetching user data');
logger.info('Data loaded successfully');
logger.warn('Cache is getting full');
logger.error('Failed to load data');
```

#### Structured Logging with Metadata

```typescript
const logger = createScopedLogger('API');

// With metadata
logger.info('API request completed', {
  endpoint: '/api/users',
  method: 'GET',
  duration: 234,
  status: 200
});

logger.error('API request failed', {
  endpoint: '/api/users',
  method: 'POST',
  error: 'Network timeout',
  retryCount: 3
});
```

#### Performance Tracking

```typescript
const logger = createScopedLogger('Performance');

function trackOperation(name: string, operation: () => Promise<any>) {
  const startTime = performance.now();
  
  return operation()
    .then(result => {
      const duration = performance.now() - startTime;
      logger.info(`Operation completed: ${name}`, { duration, success: true });
      return result;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      logger.error(`Operation failed: ${name}`, { duration, error: error.message });
      throw error;
    });
}
```

## ⚙️ Configuration

### Environment-Based Configuration

```typescript
import { getLogger, LogLevel } from '@atlantis-gr/svelte-logging-abstractions';

// Configure based on environment
const isDevelopment = import.meta.env.DEV;
const rootLogger = getLogger();

if (isDevelopment) {
  rootLogger.setLevel(LogLevel.DEBUG);
} else {
  rootLogger.setLevel(LogLevel.WARN);
}
```

### Custom Log Formatters

```typescript
import { getLogger } from '@atlantis-gr/svelte-logging-abstractions';

const logger = getLogger();

// Custom formatter (if supported by implementation)
logger.setFormatter((level, scope, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] ${scope}: ${message}${metaStr}`;
});
```

## 🔍 Advanced Usage

### Conditional Logging

```typescript
const logger = createScopedLogger('ConditionalLogger');

// Only log in development
if (import.meta.env.DEV) {
  logger.debug('Debug information');
}

// Log with conditions
function logUserAction(action: string, user: User) {
  if (user.isAdmin) {
    logger.warn(`Admin action performed: ${action}`, { userId: user.id });
  } else {
    logger.info(`User action: ${action}`, { userId: user.id });
  }
}
```

### Error Boundary Logging

```svelte
<script>
  import { createScopedLogger } from '@atlantis-gr/svelte-logging-abstractions';
  
  const logger = createScopedLogger('ErrorBoundary');
  
  function handleError(error) {
    logger.error('Component error caught', {
      error: error.message,
      stack: error.stack,
      component: 'MyComponent'
    });
  }
</script>

{#if errorState}
  <div class="error-message">
    Something went wrong. Please try again.
  </div>
{/if}
```

### Integration with Error Tracking

```typescript
import { createScopedLogger } from '@atlantis-gr/svelte-logging-abstractions';

const logger = createScopedLogger('ErrorTracking');

// Custom error handler that logs and reports
function handleApplicationError(error: Error, context?: Record<string, any>) {
  // Log locally
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
  
  // Report to external service (Sentry, etc.)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
}
```

## 🧪 Testing

### Testing with Loggers

```typescript
import { createScopedLogger } from '@atlantis-gr/svelte-logging-abstractions';
import { vi } from 'vitest';

describe('UserService', () => {
  let logger: Logger;
  
  beforeEach(() => {
    logger = createScopedLogger('UserService');
    // Mock console methods if needed
    vi.spyOn(console, 'log');
    vi.spyOn(console, 'warn');
    vi.spyOn(console, 'error');
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  test('logs user creation', () => {
    const userService = new UserService(logger);
    userService.createUser({ name: 'John' });
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('User created')
    );
  });
});
```

### Development vs Production

```typescript
// development.ts
import { getLogger, LogLevel } from '@atlantis-gr/svelte-logging-abstractions';

export function setupDevelopmentLogging() {
  const logger = getLogger();
  logger.setLevel(LogLevel.DEBUG);
  
  // Enhanced logging for development
  const originalError = console.error;
  console.error = (...args) => {
    logger.error('Console error', { args });
    originalError.apply(console, args);
  };
}

// production.ts
export function setupProductionLogging() {
  const logger = getLogger();
  logger.setLevel(LogLevel.ERROR);
  
  // Send errors to monitoring service
  logger.setErrorHandler((message, meta) => {
    // Send to monitoring service
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({ message, meta, timestamp: new Date() })
    });
  });
}
```

## 📊 Performance Considerations

### Lazy Logging

```typescript
const logger = createScopedLogger('Performance');

// Expensive computation for debug info
logger.debug(() => {
  const expensiveData = computeExpensiveDebugInfo();
  return `Debug info: ${JSON.stringify(expensiveData)}`;
});

// Only computed if debug level is enabled
```

### Batched Logging

```typescript
class BatchedLogger {
  private batch: LogEntry[] = [];
  private logger = createScopedLogger('BatchedLogger');
  
  constructor(private batchSize = 10, private flushInterval = 5000) {
    setInterval(() => this.flush(), flushInterval);
  }
  
  log(level: string, message: string, meta?: any) {
    this.batch.push({ level, message, meta, timestamp: Date.now() });
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }
  
  flush() {
    if (this.batch.length > 0) {
      this.logger.info('Batch log entries', { entries: this.batch });
      this.batch = [];
    }
  }
}
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/your-org/svelte-components/issues)
- 💬 [Discussions](https://github.com/your-org/svelte-components/discussions)