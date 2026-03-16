# Releasing Gitea Desktop

## Prerequisites

- Push access to the repository
- Repository hosted on GitHub (for GitHub Actions)

## Creating a Release (v0.0.1)

### 1. Update the version

Ensure `app/package.json` has the correct version (e.g. `0.0.1` for v0.0.1).

### 2. Commit and push

```bash
git add app/package.json
git commit -m "Bump version to 0.0.1"
git push origin main
```

### 3. Create and push the tag

```bash
git tag v0.0.1
git push origin v0.0.1
```

### 4. GitHub Actions will automatically

1. **Build** the app for:
   - macOS (Intel x64 and Apple Silicon arm64)
   - Windows (x64 and arm64)

2. **Create a GitHub Release** with the built artifacts attached.

### 5. Optional: Configure secrets

For OAuth sign-in to work in the built app, set these repository secrets in GitHub:

- `DESKTOP_OAUTH_CLIENT_ID` - From your Gitea OAuth2 application
- `DESKTOP_OAUTH_SECRET` - From your Gitea OAuth2 application

If not set, users can still sign in with **Personal Access Token** (recommended for self-hosted).

## Build output

The release workflow produces:

| Platform  | File(s)                                      |
|-----------|-----------------------------------------------|
| macOS x64 | `Gitea Desktop-x64.zip`                       |
| macOS arm64 | `Gitea Desktop-arm64.zip`                  |
| Windows x64 | `GiteaDesktopSetup-x64.exe`, `.msi`       |
| Windows arm64 | `GiteaDesktopSetup-arm64.exe`, `.msi`    |

## Code signing (optional)

First releases are **unsigned**. To sign builds:

- **macOS**: Configure Apple Developer credentials and notarization
- **Windows**: Configure Azure Code Signing (see original GitHub Desktop CI)

This requires additional secrets and setup in the workflow.
