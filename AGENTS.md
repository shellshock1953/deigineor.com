# deigineor.com

Portfolio of the music project "Deigineor" (owner: shellshock1953). Two sites live in this repo.

## Sites

- **Legacy (Hugo + Blonde theme)**: everything outside `v2/` (`content/`, `static/`, `layouts/`, `themes/`, `config.toml`).
  Retired 2026-10-27: no longer deployed (GitHub Pages off, last state tagged `legacy-hugo-final`). Kept as source/archive.
  Its old URLs (`/post/<slug>/`, `/archives/`, `/tags/`, ...) are redirected by `v2/app/next.config.ts`. Frozen: do not touch unless the owner asks.
- **v2 (new)**: Next.js + Payload CMS 3 app in `v2/app/`, live at https://deigineor.com
  (`www.` 301s to it; the old `v2.deigineor.com` was retired 2026-11-13). Admin interface at https://deigineor.com/admin. Database is CloudNativePG (`deigineor-postgres`),
  and uploaded media is stored on a PersistentVolumeClaim (`deigineor-media`) at `/data/media`.
- **Store host**: https://store.deigineor.com is the same app, shop only (store home at `/`, paid `/instruments/<slug>`, checkout, thanks, account, legal pages; `/api/*` on both hosts).
  `v2/app/src/proxy.ts` + `src/lib/store.ts` decide per `Host`: other paths on the store host redirect to deigineor.com, and `/store`, `/checkout`, `/thanks`, `/account` on deigineor.com redirect to the store.
  The Paddle webhook, account emails and licence links use `STORE_URL` (default the store host). It exists so Paddle's domain review sees a software shop, not a music portfolio.
- **Deploy manifests**: `v2/deploy/` (kustomize), synced by the ArgoCD app `deigineor`, defined in
  `shellshock1953/UES` at `services/helm/argocd-apps/libra.yaml`. Namespace `deigineor`.
  Deployed automatically on push to `main` via image build + kustomize image tag bump.

## Workflow

1. Branch, change, `just check`.
2. PR, merge when CI is green.
3. GitHub Actions builds the image, pushes `ghcr.io/shellshock1953/deigineor.com/app:sha-<shortsha>`, updates `newTag` in `v2/deploy/kustomization.yaml`, and commits back to `main`.
4. ArgoCD syncs the deployment to eridanus (served through its Cloudflare tunnel). Check status with `just status` or https://deigineor.com.

## Tasks

Tasks live in GitHub Issues of `shellshock1953/deigineor.com`, tracked on the project board
**https://github.com/users/shellshock1953/projects/2** (Status: Todo / In Progress / Done). History imported from Trello
carries `trello:<list>` labels.

- New task: `just task-new "<title>" "<body>"` creates the issue and adds it to the board. Never keep task lists in markdown.
- The board is a user project: the GitHub App token `gh` uses by default cannot see it. Prefix board commands with
  `AGENT_GH_APP=` so the gh wrapper uses the owner PAT (scope `project`), e.g. `AGENT_GH_APP= gh project item-list 2 --owner shellshock1953`.
- Project workflows auto-add new issues, move closed items to Done and linked PRs to In Progress, so autopilot
  (issues labelled `auto:*`) shows up on the board without extra steps. Reference the issue in PRs (`Fixes #N`).

## Rules

- Only real content (releases, links, text from the legacy site or the owner). Invent nothing.
- Keep v2 usable at 360px width without horizontal scroll; keep alt texts, contrast, focus states and `prefers-reduced-motion`.
- Do not edit `v2/deploy` casually: ArgoCD applies it to production.

## Commands (`justfile`)

- `just check`: render `v2/deploy`, verify local `href`/`src` in `v2/site/*.html` exist, parse the HTML.
- `just serve`: local preview at http://localhost:8000.
- `just status`: HTTP status of the site and pods on libra.
- `just dashboard-sync`: sync Grafana dashboard to monitoring namespace on ara.

## Feature flags (Unleash)

- Unleash runs on ara: UI https://unleash.kudu-skate.ts.net, project `default`; every flag of this site is prefixed `deigineor.`.
  The app reads it with `UNLEASH_URL` + `UNLEASH_CLIENT_TOKEN` (`src/lib/flags.ts`); without Unleash every flag is off.
- Testers are the segment `deigineor-testers` (`userId IN [emails]`). The userId is the signed-in `/account` email.
- Server code: `isEnabled(name, email)` from `src/lib/flags.ts`. Client code: `<FeatureGate flag="deigineor.x" fallback={...}>` (`src/components/FeatureGate.tsx`),
  which reads `/api/flags` (one fetch per page, fails open: no flags).
- Flags:
  - `deigineor.own.<entitlement>`: the tester owns that product without a paid licence.
  - `deigineor.revoked.<entitlement>`: the tester's licence for it counts as revoked (the same case as an entry in `revoked.json`).
  - `deigineor.tester`: on for the testers segment; lets a tester without any `own.*` flag get a sign-in link at `/account`.
  - `deigineor.paddle-sandbox`: once the main Paddle env is `production`, the tester's buy button checks out in the Paddle sandbox
    (needs `PADDLE_SANDBOX_*` secrets and the library's `paddleSandboxPriceId`; the webhook accepts both accounts). No-op while the main env is sandbox.
  - `deigineor.sales-paused`: global kill switch. When on, Buy buttons are hidden and `/checkout` says sales are paused. Normally off.
- Gate a new section: create `deigineor.<name>` in Unleash with the `deigineor-testers` segment, wrap the section in `<FeatureGate>`.
  When it is ready, enable the flag for everyone, then delete the flag and the gate in a follow-up PR.

## NotebookLM

Project notebook: **deigineor** (`4c83a6ab-4c1a-4515-b21e-02a27bcd745b`). It holds this project's knowledge: README and agent docs, architecture, decisions and research.
Keep it up to date. When a PR changes README.md, AGENTS.md or the docs that describe how the project works, replace that source in the notebook. When a decision or research result is worth keeping, add it.
How: see the "NotebookLM" section of the global agent instructions (`nlm source add 4c83a6ab-4c1a-4515-b21e-02a27bcd745b --file <file.md> --title "<YYYY-MM-DD> <topic>" --wait`).
