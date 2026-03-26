# Releasing Gitea Desktop

## When workflows run

- **Release** — Runs when you **publish** a GitHub Release (not on every push). It builds macOS, Windows, and Linux and uploads binaries to that release.
- **CI** — Only runs when triggered manually (`workflow_dispatch`) or when called by another workflow. It does **not** run on every PR/push.
- **Triage scheduled tasks** — Cron schedules are **disabled**; use **Run workflow** if you need triage jobs.

## Publish a version

1. Commit and push your code (including any fixes) to the default branch.
2. Create and push a tag, e.g. `git tag v0.1.1 && git push origin v0.1.1`.
3. On GitHub: **Releases** → **Draft a new release** → choose the tag → add notes → **Publish release**.
4. The **Release** workflow builds all platforms and attaches artifacts to that release.

## Manual build (optional)

Actions → **Release** → **Run workflow** → enter the tag (e.g. `v0.1.1`) → Run. Requires an existing tag; assets are uploaded to the matching release if it exists.

## Build must pass locally first

If `yarn build:prod` fails on CI, fix TypeScript errors and push before publishing again.

### Missing `gemoji` / `ENOENT … gemoji/images/emoji`

This fork’s Git tree may not include submodule **gitlinks** (only `.gitmodules`). Before building:

```bash
yarn ensure-vendor
# or: bash script/ensure-vendor-submodules.sh
```

CI runs this automatically after checkout.

## macOS release assets (which file to download)

- **Apple Silicon** (M1 / M2 / M3 / M4): `Gitea Desktop-macos-apple-silicon-arm64.zip`
- **Intel** Macs: `Gitea Desktop-macos-intel-x64.zip`

Release uploads use these names so they are obvious on the GitHub **Releases** page (not only `arm64` / `x64`).

### If the app quits immediately (dyld / Team ID / “Electron Framework”)

Unsigned CI builds used to leave the main executable and `Electron Framework` with **mismatched code-signing Team IDs**, which macOS rejects (often after download quarantine + App Translocation). The packaging step now runs a **deep ad-hoc re-sign** on GitHub Actions before zipping so the bundle is consistent.

If you still see gatekeeper issues after extracting:

1. Move `Gitea Desktop.app` to **Applications** (avoid running from the Downloads zip mount).
2. Or clear quarantine: `xattr -dr com.apple.quarantine /path/to/Gitea\ Desktop.app`

Local packaging without GitHub Actions does not run the deep re-sign by default; set `FORCE_MAC_DEEP_ADHOC_SIGN=1` when running `yarn package` if you need the same fix. Developer ID–signed local builds can set `SKIP_MAC_DEEP_ADHOC_SIGN=1` to avoid replacing that signature.

## Data folder vs GitHub Desktop (macOS / Windows)

Electron stores app data under a directory derived from the **`name`** field in [`app/package.json`](../app/package.json). Upstream GitHub Desktop used `"name": "desktop"`, which made **Gitea Desktop** share **`~/Library/Application Support/desktop`** (macOS) or **`%AppData%/desktop`** (Windows) with GitHub Desktop — so settings, IndexedDB, and UI state could **mix or overwrite** each other.

This fork sets **`"name": "gitea-desktop"`**, so data lives in:

- **macOS:** `~/Library/Application Support/gitea-desktop/`
- **Windows:** `%AppData%/gitea-desktop/`

After updating, treat this as a **fresh profile** unless you manually copy data from the old folder. Run only **one** of GitHub Desktop or Gitea Desktop if you still use both, or keep them on separate user accounts.
