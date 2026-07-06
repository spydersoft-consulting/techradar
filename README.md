# Tech Radar

Spydersoft's Technology Radar application, consolidated from the formerly separate `techradar-data-api` and `techradar-frontend` repositories into one repository with two components:

- [`data-api/`](data-api/README.md) — the .NET 10 Web API + EF Core (Npgsql) backend
- [`frontend/`](frontend/README.md) — the .NET 10 BFF + Vite/React SPA frontend

Both components are built, versioned, and released together from this repository's single pipeline (`.devops/pipeline-build.yml`), publishing to the same container images as before (`ghcr.io/spydersoft-consulting/techradar-data-api`, `ghcr.io/spydersoft-consulting/techradar-frontend`) and updating [`techradar-helm-config`](https://github.com/spydersoft-consulting/techradar-helm-config) with both image tags in a single atomic commit per build.

See each component's own README for development setup instructions.

## Contributing

1. Create your feature branch (`git checkout -b feature/fooBar`)
2. Commit your changes (`git commit -am 'Add some fooBar'`)
3. Push to the branch (`git push origin feature/fooBar`)
4. Create a new Pull Request
