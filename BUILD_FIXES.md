# Build Fixes & Release Guide for Gitea Desktop

Apply these fixes to resolve build errors, add Linux support, and prevent conflicts with GitHub Desktop.

---

## Part 1: Fix the 6 Build Errors

### 1. app/src/lib/api.ts

**Fix A – Remove unused `isGiteaEndpoint` import (line ~19):**
```diff
 import {
   getEndpointVersion,
-  isGiteaEndpoint,
   updateEndpointVersion,
 } from './endpoint-capabilities'
```

**Fix B – Add `isGHES` import (line ~2110 uses it but it's not imported):**
```diff
 import {
   getEndpointVersion,
+  isGHES,
   updateEndpointVersion,
 } from './endpoint-capabilities'
```

**Fix C – Fix URLSearchParams type error (line ~2325):**  
`client_id` and `client_secret` can be `undefined`. Filter them out before building the body:

```typescript
const body = new URLSearchParams(
  Object.fromEntries(
    Object.entries({
      client_id: ClientID ?? '',
      client_secret: ClientSecret ?? '',
      code: code,
      grant_type: 'authorization_code',
    }).filter(([, v]) => v !== '') as [string, string][]
  )
).toString()
```

### 2. app/src/lib/endpoint-capabilities.ts

**Fix – Let `supportsRepoRules` and `supportsAliveSessions` accept the argument:**
```diff
-export const supportsAliveSessions = () => false
-export const supportsRepoRules = () => false
+export const supportsAliveSessions = (_ep?: string) => false
+export const supportsRepoRules = (_ep?: string) => false
```

### 3. app/src/lib/stores/sign-in-store.ts

**Fix – Remove unused `isDotComAccount` import:**
```diff
-import { Account, isDotComAccount } from '../../models/account'
+import { Account } from '../../models/account'
```

---

## Part 2: Prevent Conflicts with GitHub Desktop

Ensure Gitea Desktop uses different IDs and paths than GitHub Desktop:

| Setting | GitHub Desktop | Gitea Desktop |
|--------|----------------|---------------|
| `productName` | GitHub Desktop | Gitea Desktop |
| `bundleID` (macOS) | com.github.GitHubClient | com.gitea.Desktop |
| Windows AppUserModelId | com.squirrel.GitHubDesktop... | com.squirrel.GiteaDesktop... |
| Auth storage key | GitHub - endpoint | Gitea Desktop - endpoint |
| Config folder | GitHub Desktop | Gitea Desktop |

Check these in:

- `app/package.json` – `productName`, `bundleID`
- `app/src/lib/auth.ts` – `getKeyForEndpoint`
- `app/src/main-process/main.ts` – `setAppUserModelId` (Windows)
- `script/build.ts` – protocol schemes (`x-gitea-desktop-auth` vs `x-github-desktop-auth`)

---

## Part 3: Linux Build (Ubuntu/Debian/AppImage)

### Add Linux to the release workflow

In `.github/workflows/release.yml`, add a Linux job:

```yaml
  build-linux:
    name: Build Linux ${{ matrix.arch }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        arch: [x64, arm64]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: yarn

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2t64
        env:
          npm_config_arch: ${{ matrix.arch }}

      - name: Install and build
        run: |
          yarn
          yarn build:prod
        env:
          RELEASE_CHANNEL: production
          NODE_ENV: production
          DESKTOP_OAUTH_CLIENT_ID: ${{ secrets.DESKTOP_OAUTH_CLIENT_ID }}
          DESKTOP_OAUTH_SECRET: ${{ secrets.DESKTOP_OAUTH_SECRET }}
          npm_config_arch: ${{ matrix.arch }}
          TARGET_ARCH: ${{ matrix.arch }}

      - name: Package AppImage
        run: |
          npx electron-builder --linux AppImage --x64
        env:
          npm_config_arch: ${{ matrix.arch }}

      - name: Upload Linux artifact
        uses: actions/upload-artifact@v4
        with:
          name: linux-${{ matrix.arch }}
          path: dist/*.AppImage
```

### Enable Linux in `electron-builder`

In `package.json` or `script/package.ts`, ensure Linux targets (e.g. AppImage) are included when building for Linux.

The original GitHub Desktop does not officially support Linux, so you may need to add `electron-builder` config for Linux and adjust `script/package.ts` for Linux packaging.

---

## Quick Apply Checklist

- [ ] Apply api.ts fixes (A, B, C)
- [ ] Apply endpoint-capabilities.ts fix
- [ ] Apply sign-in-store.ts fix
- [ ] Confirm bundle IDs and names (no clash with GitHub Desktop)
- [ ] Add Linux job to release workflow (optional)
- [ ] Run `yarn build:prod` locally to verify
- [ ] Push and let CI build
