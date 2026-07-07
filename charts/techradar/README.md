# techradar chart

Helm chart for the Tech Radar application: `frontend` (BFF + React SPA) and `data-api` (the Data API), built on top of the [`bjw-s` common library chart](https://github.com/bjw-s-labs/helm-charts).

Published as an OCI artifact from this repo's own pipeline on every `main` (beta) and tag (release) build, versioned to match the built container images. Consumed from `techradar-helm-config`, which owns environment-specific values and the Postgres instance this chart connects to (kept as a separate release there, deliberately outside this chart, so an app deploy can never touch the database).

This chart has **no secret-provider dependency** — it doesn't know about Vault, Sealed Secrets, or any other mechanism. It only expects two Kubernetes Secrets to already exist by name; creating them (however the composing environment chooses to) is the composing helm-config's responsibility, not this chart's.

## Secrets contract

| Secret (default name) | Referenced by | Required keys |
| --- | --- | --- |
| `techradar-data-api` | `data-api`, via `controllers.data-api.containers.main.envFrom` | `ConnectionStrings__TechRadarDatabase`, `Identity__Authority` |
| `techradar-frontend` | `frontend`, via `controllers.frontend.containers.main.envFrom` | `OidcProxySettings__Oidc__Authority`, `OidcProxySettings__Oidc__ClientId`, `OidcProxySettings__Oidc__ClientSecret` |

Both default names are plain values (`controllers.<name>.containers.main.envFrom`), overridable like any other `bjw-s` common-chart value if the composing helm-config wants to point at differently-named secrets. `techradar-helm-config` creates these two secrets via its own `ExternalSecret`s (Vault-backed, this org's current choice) — see that repo's `apps/techradar/charts/techradar/templates/` for the actual mechanism. A different helm-config consuming this chart could create the same two secrets any other way (Sealed Secrets, a plain manually-managed `Secret`, a different `ClusterSecretStore`, etc.) without this chart needing to change at all.

## Values

Only chart-specific values are documented here — everything under `controllers`/`service`/`route`/`configMaps` follows the `bjw-s` common chart's own schema (see its documentation for the full set of available options).

| Key | Description | Default |
| --- | --- | --- |
| `controllers.data-api.containers.main.envFrom[0].secretRef.name` | Name of the Secret containing `data-api`'s connection string/authority (see contract above). | `techradar-data-api` |
| `controllers.frontend.containers.main.envFrom[0].secretRef.name` | Name of the Secret containing `frontend`'s OIDC settings (see contract above). | `techradar-frontend` |
| `env_name` | Environment name, used in telemetry labeling (set by `techradar-helm-config`'s per-environment values). | `dev` |
| `controllers.frontend.containers.main.image.tag` / `controllers.data-api.containers.main.image.tag` | Image tags — normally set by `techradar-helm-config` from `imageTags.frontend`/`imageTags.data_api`. | `latest` |

## Structure

- `templates/common.yaml` — the `bjw-s` common chart loader (standard boilerplate, do not remove).
- `templates/_helpers.tpl` — standard chart-scaffold label/name helpers.
