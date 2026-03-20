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
