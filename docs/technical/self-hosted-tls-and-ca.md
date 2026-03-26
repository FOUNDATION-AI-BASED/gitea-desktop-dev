# Self-hosted TLS and custom CA (spike)

This spike summarizes how **Node**, **Electron**, and **Git** handle TLS when connecting to a **self-hosted Gitea** instance with a **private CA** or **self-signed** certificate. Use it to inform future UI or documentation; it is not a substitute for your org’s security policy.

## Goals

- Allow HTTPS API calls (`https://gitea.example/api/v1/...`) and Git operations (`https://gitea.example/...`) to succeed when the server chain is signed by a private CA.
- Avoid disabling TLS verification globally.

## Electron / Chromium (renderer and main process)

- Chromium uses the **OS trust store** (macOS Keychain, Windows certificate store, Linux NSS/`/etc/ssl/certs` depending on distribution).
- **Recommended:** Install the **root or intermediate CA** certificate into the OS trust store on each developer machine. No app change required for standard Electron `fetch`/`window.fetch` if the OS trusts the CA.

## Node.js (main process, scripts, Git invoked from app)

- Node’s `https` module uses **OpenSSL** and, by default, Mozilla’s CA bundle bundled with Node, **not** always the same as the OS store on Linux.
- **`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`** — Appends one PEM file (can contain multiple certs) to Node’s trust store for the process. Suitable for CI and power users. Electron’s main process inherits this if set **before** the app starts (e.g. launcher script or desktop file `Exec=` env).

## Git

- Git uses its own SSL backend (often OpenSSL) with `http.sslCAInfo` or `http.sslCAPath`, or can use the **OS store** depending on build (e.g. `schannel` on Windows).
- For corporate environments, common approaches:
  - **`git config --global http.sslBackend openssl`** + `http.sslCAInfo` pointing at the org CA bundle, or
  - System-wide CA install so Git’s OpenSSL picks it up.

Desktop already runs Git as a subprocess; ensuring **consistent env** between UI and CLI (e.g. passing through `GIT_SSL_CAINFO` only when explicitly configured) is a future enhancement.

## In-app certificate error flow

- The app may surface TLS errors when adding an account or cloning. Existing code paths (e.g. certificate suppression / retry) should be reviewed when adding a “Trust this certificate” flow—**pinning fingerprints** is safer than blanket ignore.

## Future UI (optional)

1. **Settings → Advanced → Custom CA** — Let the user pick a `.pem` file; persist path in app config and set `NODE_EXTRA_CA_CERTS` for child processes only if technically feasible, or document “set env in `.desktop` / shortcut.”
2. **Test connection** — `GET /api/v1/version` with clear error text distinguishing DNS, TLS, and 401/403.

## References

- Node: [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile)
- Gitea: [API version](https://docs.gitea.com/api/1.20/#tag/miscellaneous/operation/getVersion)
