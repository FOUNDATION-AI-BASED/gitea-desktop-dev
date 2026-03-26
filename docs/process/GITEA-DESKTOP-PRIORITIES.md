# Gitea Desktop — priority focus

This document records the **chosen product/engineering track** for this fork (see feature backlog in the project plan). It is a living priority order, not a commitment date.

## Decision (current)

| Priority | Track | Rationale |
|----------|--------|-----------|
| **1** | **Self-hosted: multi-instance + TLS/CA** | Largest differentiator vs GitHub.com; unblocks most enterprise and homelab users who hit cert or trust issues first. |
| **2** | **Workflow: “Open on Gitea” + fork UX** | Daily-use wins with relatively small surface area once base URL is reliable. |
| **3** | **API parity + feature flags** | Required for long-term correctness across Gitea versions; pairs with version probing (`/api/v1/version`). |

## What “implementing” each track means

1. **Self-hosted** — Document and, where appropriate, add settings for custom CA trust (`NODE_EXTRA_CA_CERTS`, OS trust store); optional UI for “Test connection” to `{origin}/api/v1/version`; long-term: saved instance profiles. See [Self-hosted TLS and CA](../technical/self-hosted-tls-and-ca.md).

2. **Workflow** — Deep links to the configured Gitea web UI (file, branch, commit, PR); fork destination org/user when Gitea’s API allows.

3. **API parity** — Map REST usage to Gitea’s API; gate GitHub-only paths behind capability checks. See [Gitea API audit](../technical/gitea-api-audit.md).

## Out of scope (for this priority pass)

- Full parity with GitHub Actions UI (check runs, workflow reruns) unless Gitea exposes compatible endpoints.
- GitHub Copilot–specific features remain optional/disabled where they depend on github.com.

## Related docs

- [Gitea API audit](../technical/gitea-api-audit.md)
- [Self-hosted TLS and CA](../technical/self-hosted-tls-and-ca.md)
- [Releasing Gitea Desktop](../RELEASING-GITEA.md)
