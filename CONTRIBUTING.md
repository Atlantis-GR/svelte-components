# Contributing Guidelines

Guidelines for contributing to the Svelte Components Library.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- PowerShell (for Windows build scripts)
- Git

### Development Setup

1. Fork and clone the repository
   ```bash
   git clone <your-fork-url>
   cd svelte-components
   ```

2. Install dependencies for all components
   ```bash
   # Authentication library
   cd Svelte.Auth
   npm install
   
   # Configuration library
   cd ../Svelte.Config
   npm install
   
   # Logging abstractions
   cd ../Svelte.Logging.Abstractions
   npm install
   
   # Sample application
   cd ../Svelte.Sample
   npm install
   
   # API server
   cd ../Svelte.Sample.Api
   npm install
   ```

3. Set up the development environment
   ```bash
   # Use build scripts for development
   pwsh -File build-auth.ps1
   # or
   pwsh -File build-config.ps1
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow Svelte 5 conventions and runes
- Use Prettier for code formatting
- Follow conventional commit message format

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(auth): add OAuth token refresh functionality
fix(config): resolve feature flag update issue
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Testing

- Add tests for new features and bug fixes
- Ensure all existing tests pass
- Run type checking: `npm run check`
- Run linting: `npm run lint`

### Documentation

- Update relevant README files
- Add JSDoc comments for public APIs
- Include code examples for new features
- Update CHANGELOG.md for significant changes

## Pull Request Process

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. Test your changes
   ```bash
   npm run check    # Type checking
   npm run lint     # Linting
   npm run format   # Code formatting
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "feat(scope): description of your changes"
   ```

5. Push to your fork and create a Pull Request
   - Use a descriptive title
   - Provide a detailed description
   - Reference any related issues

### Pull Request Review

- All PRs require at least one review
- Address reviewer feedback promptly
- Keep PRs focused and atomic
- Rebase on main before merging

## Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Code examples or screenshots if applicable

Use the bug report template:

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, macOS 12]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]
- Package versions: [relevant versions]

## Additional Context
Any other relevant information
```

## Feature Requests

For feature requests:

- Check if the feature already exists
- Search existing issues and discussions
- Provide a clear use case
- Explain the benefits

## Component-Specific Guidelines

### Authentication Library (Svelte.Auth)

- Follow OAuth 2.0/OIDC standards
- Maintain backward compatibility
- Test with multiple identity providers
- Document configuration options

### Configuration Library (Svelte.Config)

- Ensure type safety for config values
- Support runtime updates
- Maintain performance for large configs
- Document feature flag patterns

### Logging Abstractions

- Keep interfaces minimal and flexible
- Support multiple environments
- Maintain performance
- Follow structured logging patterns

### Sample Application

- Demonstrate all library features
- Keep examples simple and clear
- Update when library APIs change
- Maintain responsive design

## Architecture Decisions

When making significant architectural changes:

1. Open an issue for discussion
2. Consider backward compatibility
3. Document the decision rationale
4. Update relevant documentation
5. Provide migration guides if needed

## Getting Help

- Check the documentation first
- Search existing issues
- Start a discussion for questions
- Contact maintainers for urgent issues