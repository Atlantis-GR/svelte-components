# Publishing to NPM

Packages are published manually through GitHub Actions.

## Setup

### NPM Token

Create an NPM access token and add it to GitHub secrets:

1. Go to npmjs.com, log in, and navigate to Access Tokens
2. Generate a new Granular Access Token with read/write access to the `@atlantis-gr` organization
3. In your GitHub repository, go to Settings > Secrets and variables > Actions
4. Add a new secret named `NPM_TOKEN` with your token value

### Publishing Process

To publish packages manually:

1. Update version if needed: `npm version patch`
2. Commit changes: `git add . && git commit -m "bump version" && git push`
3. Go to Actions tab > "Manual NPM Publish" > Run workflow
4. Select packages to publish

## Development

### Build Scripts

```powershell
.\build-auth.ps1
.\build-config.ps1
```

### Local Publishing

To publish from your local machine:

```bash
cd Svelte.Auth && npm run build && npm publish --access public
cd Svelte.Config && npm run build && npm publish --access public  
cd Svelte.Logging.Abstractions && npm run build && npm publish --access public
```

## Dependencies

Publish order matters:
- `svelte-logging-abstractions` (base)
- `svelte-auth` and `svelte-config` (depend on logging)

## Common Issues

**Version conflicts**: Run `npm version patch` to increment version

**Auth errors**: Check NPM token permissions and GitHub secrets

**Build failures**: Run `npm run check && npm run format && npm run build` locally first