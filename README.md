# Svelte Components Library

A collection of Svelte components for authentication, configuration management, and logging.

## Overview

This repository contains modular Svelte components built with TypeScript and Svelte 5. The components are designed for use in web applications that need authentication, dynamic configuration, and structured logging.

## Components

### Authentication (`Svelte.Auth`)
OAuth/OIDC authentication library with support for identity providers like Keycloak.

- OAuth 2.0 / OpenID Connect support
- Automatic token refresh
- Route guards and authentication context
- TypeScript definitions

### Configuration Management (`Svelte.Config`)
Runtime configuration management for application settings and feature flags.

- Environment-specific configurations
- Feature flags
- Configuration debugging tools
- Secure configuration handling

### Logging Abstractions (`Svelte.Logging.Abstractions`)
Logging abstractions for structured application logging.

- Multiple logging levels
- Scoped loggers
- Custom log formatters
- Browser and server compatibility

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PowerShell (for Windows build scripts)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd svelte-components
   ```

2. Build and install components:
   ```bash
   # For authentication components
   pwsh -File build-auth.ps1

   # For configuration components  
   pwsh -File build-config.ps1
   ```

3. Start the sample application:
   ```bash
   cd Svelte.Sample
   npm run dev
   ```

4. Start the API server (in a separate terminal):
   ```bash
   cd Svelte.Sample.Api
   npm install
   npm run db:init
   npm run db:seed
   npm run dev
   ```

The demo application will be available at `http://localhost:5173`.

## Project Structure

```
.
├── Svelte.Auth/                    # Authentication library
├── Svelte.Config/                  # Configuration management library  
├── Svelte.Logging.Abstractions/   # Logging abstractions
├── Svelte.Sample/                  # Demo application (SvelteKit)
├── Svelte.Sample.Api/              # Demo API server (Express.js)
├── build-auth.ps1                  # Auth library build script
├── build-config.ps1                # Config library build script
└── README.md                       # Project documentation
```

## Demo Application

The sample application demonstrates the usage of the component libraries:

- Authentication flow with OAuth
- Configuration management with feature flags
- Post editor with markdown support
- API integration with authentication
- Responsive UI design

## Development

### Building Components

Each component can be built independently:

```bash
# Build authentication library
cd Svelte.Auth
npm run build

# Build configuration library  
cd Svelte.Config
npm run build

# Build logging abstractions
cd Svelte.Logging.Abstractions
npm run build
```

### Code Quality

```bash
# Type checking
npm run check

# Code formatting
npm run format

# Linting
npm run lint
```

## Documentation

- [Authentication Guide](./Svelte.Auth/README.md) - OAuth setup and usage
- [Configuration Guide](./Svelte.Config/README.md) - Runtime config management
- [API Documentation](./Svelte.Sample.Api/README.md) - Backend API reference
- [Sample App Guide](./Svelte.Sample/README.md) - Demo application overview

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

Follow TypeScript best practices and ensure all checks pass before submitting.

## License

MIT License - see [LICENSE](LICENSE) file for details.