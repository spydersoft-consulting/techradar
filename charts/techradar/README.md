# techradar chart

Helm chart for the Tech Radar application: `frontend` (BFF + React SPA) and `data-api` (the Data API), built on top of the [`bjw-s` common library chart](https://github.com/bjw-s-labs/helm-charts).

Published as an OCI artifact from this repo's own pipeline on every `main` (beta) and tag (release) build, versioned to match the built container images. Consumed from `techradar-helm-config`, which owns environment-specific values and the Postgres instance this chart connects to (kept as a separate release there, deliberately outside this chart, so an app deploy can never touch the database).

## Values

Only chart-specific values are documented here — everything under `controllers`/`service`/`route`/`configMaps` follows the `bjw-s` common chart's own schema (see its documentation for the full set of available options).

| Key | Description | Default |
| --- | --- | --- |
| `vaultPathPrefix` | Path prefix used when looking up secrets from Vault: `secrets-k8/<vaultPathPrefix>/<env_name>/...`. Override if this chart is reused under a different app name or vault layout. | `techradar` |
| `postgres.host` | Hostname of the Postgres instance `data-api` connects to. | `techradar-postgres` |
| `postgres.database` | Database name in the connection string. | `techradar` |
| `env_name` | Environment name, used both in the Vault path prefix above and in telemetry labeling (set by `techradar-helm-config`'s per-environment values). | `dev` |
| `controllers.frontend.containers.main.image.tag` / `controllers.data-api.containers.main.image.tag` | Image tags — normally set by `techradar-helm-config` from `imageTags.frontend`/`imageTags.data_api`. | `latest` |

### Pointing at a different Postgres instance

By default this chart assumes a Postgres instance is reachable at `techradar-postgres` (the stable service name `techradar-helm-config`'s own postgres release creates) with a database named `techradar`. To point at a different instance — a different in-cluster service, or an external/managed Postgres — override:

```yaml
postgres:
  host: my-external-postgres.example.com
  database: my_database_name
```

Credentials are still pulled via an `ExternalSecret` from Vault at `secrets-k8/<vaultPathPrefix>/<env_name>/postgres` (properties `user`/`password`), regardless of where `postgres.host` points — this chart does not currently support a non-Vault credential source. If the target Postgres instance's credentials don't live at that Vault path, either populate them there, or replace `templates/techradar-data-api-es.yaml`'s `ExternalSecret` with your own secret-provisioning approach (the only contract `data-api` relies on is a Kubernetes Secret named `techradar-data-api` containing a `ConnectionStrings__TechRadarDatabase` key).

## Structure

- `templates/common.yaml` — the `bjw-s` common chart loader (standard boilerplate, do not remove).
- `templates/techradar-data-api-es.yaml` — `data-api`'s own secrets (DB connection string, OIDC authority), sourced from Vault.
- `templates/techradar-frontend-es.yaml` — `frontend`'s own secrets (OIDC client credentials), sourced from Vault.
- `templates/_helpers.tpl` — standard chart-scaffold label/name helpers.
