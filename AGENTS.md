# deigineor.com

Portfolio of the music project "Deigineor" (owner: shellshock1953). Two sites live in this repo.

## Sites

- **Legacy (Hugo + Blonde theme)**: everything outside `v2/` (`content/`, `static/`, `layouts/`, `themes/`, `config.toml`).
  Deployed to GitHub Pages by `.github/workflows/hugo.yml`, serves https://deigineor.com. Frozen: do not touch unless the owner asks.
- **v2 (new)**: `v2/site/` is plain static HTML/CSS (no build step), live at https://v2.deigineor.com.
  The libra k8s cluster runs nginx plus a git-sync sidecar that clones `main` every 60s and serves `v2/site/`,
  so a merge to `main` is live within about a minute.
- **Deploy manifests**: `v2/deploy/` (kustomize), synced by the ArgoCD app `deigineor-web`, defined in
  `shellshock1953/UES` at `services/helm/argocd-apps/libra.yaml`. Namespace `deigineor-web`.

## Workflow

1. Branch, change, `just check`.
2. PR, merge when CI is green.
3. About a minute later check https://v2.deigineor.com (`just status`).

## Rules

- No build step and no frameworks or CDN JS in v2 unless the owner decides otherwise. Google Fonts only.
- Only real content (releases, links, text from the legacy site or the owner). Invent nothing.
- Images go through `v2/site/img`, optimised (max 800px wide, JPEG quality about 80).
- Keep v2 usable at 360px width without horizontal scroll; keep alt texts, contrast, focus states and `prefers-reduced-motion`.
- Do not edit `v2/deploy` casually: ArgoCD applies it to production.

## Commands (`justfile`)

- `just check`: render `v2/deploy`, verify local `href`/`src` in `v2/site/*.html` exist, parse the HTML.
- `just serve`: local preview at http://localhost:8000.
- `just status`: HTTP status of v2 and pods on libra.
