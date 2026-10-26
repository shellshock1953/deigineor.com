# deigineor.com

Portfolio of the music project "Deigineor" (owner: shellshock1953). Two sites live in this repo.

## Sites

- **Legacy (Hugo + Blonde theme)**: everything outside `v2/` (`content/`, `static/`, `layouts/`, `themes/`, `config.toml`).
  Deployed to GitHub Pages by `.github/workflows/hugo.yml`, serves https://deigineor.com. Frozen: do not touch unless the owner asks.
- **v2 (new)**: Next.js + Payload CMS 3 app in `v2/app/`, live at https://v2.deigineor.com.
  Admin interface at https://v2.deigineor.com/admin. Database is CloudNativePG (`deigineor-postgres`),
  and uploaded media is stored on a PersistentVolumeClaim (`deigineor-media`) at `/data/media`.
- **Deploy manifests**: `v2/deploy/` (kustomize), synced by the ArgoCD app `deigineor-web`, defined in
  `shellshock1953/UES` at `services/helm/argocd-apps/libra.yaml`. Namespace `deigineor-web`.
  Deployed automatically on push to `main` via image build + kustomize image tag bump.

## Workflow

1. Branch, change, `just check`.
2. PR, merge when CI is green.
3. GitHub Actions builds the image, pushes `ghcr.io/shellshock1953/deigineor.com/app:sha-<shortsha>`, updates `newTag` in `v2/deploy/kustomization.yaml`, and commits back to `main`.
4. ArgoCD syncs the deployment to libra. Check status with `just status` or https://v2.deigineor.com.

## Rules

- Only real content (releases, links, text from the legacy site or the owner). Invent nothing.
- Keep v2 usable at 360px width without horizontal scroll; keep alt texts, contrast, focus states and `prefers-reduced-motion`.
- Do not edit `v2/deploy` casually: ArgoCD applies it to production.

## Commands (`justfile`)

- `just check`: render `v2/deploy`, verify local `href`/`src` in `v2/site/*.html` exist, parse the HTML.
- `just serve`: local preview at http://localhost:8000.
- `just status`: HTTP status of v2 and pods on libra.
- `just dashboard-sync`: sync Grafana dashboard to monitoring namespace on ara.
