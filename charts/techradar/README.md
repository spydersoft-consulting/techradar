# techradar chart

Helm chart for the Tech Radar application: `frontend` (BFF + React SPA) and `data-api` (the Data API), built on top of the [`bjw-s` common library chart](https://github.com/bjw-s-labs/helm-charts).

Published as an OCI artifact from this repo's own pipeline on every `main` (beta) and tag (release) build, versioned to match the built container images. Consumed from `techradar-helm-config`, which owns environment-specific values and the Postgres instance this chart connects to (kept as a separate release there, deliberately outside this chart, so an app deploy can never touch the database).

This chart has **no secret-provider dependency** — it doesn't know about Vault, Sealed Secrets, or any other mechanism, and doesn't default to any particular secret name. Supplying `data-api`/`frontend`'s `envFrom` (pointing at whatever Secret the composing environment creates, however it creates it) is entirely the consuming helm-config's job.

## Secrets contract

Neither controller has a default `envFrom` — the consumer must supply one via values, pointing at a Secret it creates by whatever mechanism it chooses (Vault `ExternalSecret`, Sealed Secrets, a plain manually-managed `Secret`, etc.). That Secret must contain:

| Consumed by | Required keys |
| --- | --- |
| `data-api` (`controllers.data-api.containers.main.envFrom`) | `ConnectionStrings__TechRadarDatabase`, `Identity__Authority` |
| `frontend` (`controllers.frontend.containers.main.envFrom`) | `OidcProxySettings__Oidc__Authority`, `OidcProxySettings__Oidc__ClientId`, `OidcProxySettings__Oidc__ClientSecret` |

Example override, supplying a `secretRef` (adjust name/secret-provider mechanism as needed):

```yaml
controllers:
  data-api:
    containers:
      main:
        envFrom:
          - secretRef:
              name: my-data-api-secret
  frontend:
    containers:
      main:
        envFrom:
          - secretRef:
              name: my-frontend-secret
```

`techradar-helm-config` creates both secrets today via its own Vault-backed `ExternalSecret`s (named `techradar-data-api`/`techradar-frontend`) — see that repo's `apps/techradar/charts/techradar/templates/` for the actual mechanism.

## Values

Only chart-specific values are documented here — everything under `controllers`/`service`/`route`/`configMaps` follows the `bjw-s` common chart's own schema (see its documentation for the full set of available options).

| Key | Description | Default |
| --- | --- | --- |
| `controllers.frontend.containers.main.image.tag` / `controllers.data-api.containers.main.image.tag` | Image tags — normally set by `techradar-helm-config` from `imageTags.frontend`/`imageTags.data_api`. | `latest` |

## Structure

- `templates/common.yaml` — the `bjw-s` common chart loader (standard boilerplate, do not remove).
- `templates/_helpers.tpl` — standard chart-scaffold label/name helpers.
