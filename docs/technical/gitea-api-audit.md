# Gitea API audit (REST usage in Desktop)

This document maps **HTTP paths and flows** used by [`app/src/lib/api.ts`](../../app/src/lib/api.ts) (and related helpers) to **Gitea compatibility** expectations. Use it to add **feature flags** or **graceful degradation** when a path returns `404` / `501` on self-hosted Gitea.

**Base URL:** `{scheme}://{host}/api/v1` — set per account (`getEndpointForRepository`, `getGiteaAPIURL`).

**Version signal:** Responses may include `x-gitea-version` (see `tryUpdateEndpointVersionFromResponse` in `api.ts`). Pair with [`endpoint-capabilities.ts`](../../app/src/lib/endpoint-capabilities.ts) for gating.

## Legend

| Tag | Meaning |
|-----|---------|
| **Gitea-core** | Typical Gitea REST v1 (GitHub-like paths under `/api/v1/...`). |
| **Gitea-maybe** | May exist with different shape or version gate; verify against your Gitea version. |
| **GitHub-only** | Assumes GitHub.com / GHE features; expect failure or no-op on plain Gitea. |

---

## OAuth and session

| Method | Path / URL | Tag | Notes |
|--------|----------------|-----|--------|
| — | `{html}/login/oauth/authorize?...` | **Gitea-core** | `getOAuthAuthorizationURL` |
| POST | `{html}/login/oauth/access_token` | **Gitea-core** | `requestOAuthToken` |
| DELETE | `applications/{client_id}/token` | **Gitea-maybe** | `deleteToken` — confirm against [Gitea OAuth2 API](https://docs.gitea.com/api/1.20/#tag/user/operation/userDeleteAccessToken) / token revoke docs |

---

## User and org

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `user` | **Gitea-core** | Current user |
| GET | `user/emails` | **Gitea-maybe** | Gitea lists emails; field parity may differ |
| GET | `user/orgs` | **Gitea-maybe** | Organizations membership |
| GET | `users/{login}` | **Gitea-core** | Public user profile |
| GET | `user/repos` | **Gitea-core** | Paginated; `affiliation` query is GitHub-specific — may be ignored |
| POST | `user/repos` | **Gitea-core** | Create repo under user |
| POST | `orgs/{org}/repos` | **Gitea-maybe** | Org repo creation when orgs exist |

---

## Repositories

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/{owner}/{repo}` | **Gitea-core** | |
| HEAD | `repos/{owner}/{repo}/git` | **Gitea-maybe** | Used for `x-poll-interval`; may not exist |
| POST | `/repos/{owner}/{repo}/forks` | **Gitea-core** | Fork (leading slash in code) |

---

## Issues and comments

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/{owner}/{repo}/issues?...` | **Gitea-core** | Filters `state`, `since`; PRs may appear — client filters `pullRequest` |
| GET | `repos/{owner}/{repo}/issues/comments/{id}` | **Gitea-maybe** | |
| GET | `repos/{owner}/{repo}/issues/{number}/comments` | **Gitea-core** | |

---

## Pull requests

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/{owner}/{repo}/pulls?...` | **Gitea-core** | |
| GET | `/repos/{owner}/{repo}/pulls/{number}` | **Gitea-core** | |
| GET | `repos/{owner}/{repo}/pulls/comments/{id}` | **Gitea-maybe** | Review comment by id |
| GET | `/repos/{owner}/{repo}/pulls/{number}/reviews` | **Gitea-maybe** | |
| GET | `/repos/{owner}/{repo}/pulls/{number}/reviews/{id}/comments` | **Gitea-maybe** | |
| GET | `/repos/{owner}/{repo}/pulls/{number}/comments` | **Gitea-core** | PR conversation comments |

---

## CI / Actions / Checks (GitHub-shaped)

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/.../commits/{ref}/status` | **Gitea-maybe** | Combined status; Gitea uses commit status APIs with different conventions |
| GET | `repos/.../commits/{ref}/check-runs` | **GitHub-only** | Antiope preview |
| GET | `repos/.../actions/runs?...` | **GitHub-only** | GitHub Actions |
| GET | `repos/.../actions/runs/{id}/jobs` | **GitHub-only** | |
| POST | `/repos/.../check-suites/{id}/rerequest` | **GitHub-only** | |
| POST | `/repos/.../actions/runs/.../rerun-failed-jobs` | **GitHub-only** | |
| POST | `/repos/.../actions/jobs/{id}/rerun` | **GitHub-only** | |
| GET | `/repos/.../check-suites/{id}` | **GitHub-only** | |

*Recommendation:* Treat UI that depends on these as **disabled** when `supportsRerunningChecks` / workflow helpers return null (already partially guarded in capabilities).

---

## Branch protection and rules

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/.../branches/{branch}/push_control` | **GitHub-only** | Phandalin preview |
| GET | `repos/.../branches?protected=true` | **Gitea-maybe** | Branch listing |
| GET | `repos/.../rules/branches/{branch}` | **GitHub-only** | Rulesets |
| GET | `repos/.../rulesets` | **GitHub-only** | |
| GET | `repos/.../rulesets/{id}` | **GitHub-only** | |

`endpoint-capabilities.ts` sets `supportsRepoRules` to `false` — aligns with skipping rulesets on Gitea until adapters exist.

---

## Social / Desktop proprietary

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| GET | `repos/.../mentionables/users` | **GitHub-only** | Jerry Maguire preview |
| GET | `/desktop/avatar-token` | **GitHub-only** | |
| GET | `/desktop_internal/features` | **GitHub-only** | Feature flags |
| GET | `/desktop_internal/alive-channel` | **GitHub-only** | Alive sessions |
| GET | `/alive_internal/websocket-url` | **GitHub-only** | |
| POST | `/graphql` | **GitHub-only** | Copilot viewer query |

---

## Copilot and secret scanning

| Method | Path | Tag | Notes |
|--------|------|-----|--------|
| POST | Copilot API host (separate) | **GitHub-only** | `request` to `copilotEndpoint` |
| POST | `repos/.../secret-scanning/push-protection-bypasses` | **GitHub-only** | |

---

## Feature-flag recommendations

1. **Gate by endpoint version** — Use `getEndpointVersion` + semver checks for behaviors that landed in specific Gitea releases.
2. **404 swallow** — Many methods already return `null` / `[]` on failure; ensure GitHub-only surfaces don’t spam errors on Gitea (debug-level only).
3. **OAuth scopes** — [`oauthScopes`](../../app/src/lib/api.ts) in `api.ts` lists `read:repository`, `write:repository`, `read:user`, `write:user` — align with [Gitea scope names](https://docs.gitea.com/usage/oauth2-provider) if your instance differs.
4. **Pagination** — Relies on `Link` header / `page` params; confirm Gitea’s pagination matches `getNextPagePathFromLink` in [`http.ts`](../../app/src/lib/http.ts).

## Related

- [Gitea Desktop priorities](../process/GITEA-DESKTOP-PRIORITIES.md)
- [Self-hosted TLS and CA](./self-hosted-tls-and-ca.md)
- Gitea REST: [API docs](https://docs.gitea.com/api/1.20/)
