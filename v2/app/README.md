# deigineor.com v2 app

Next.js 16 + Payload CMS 3 (admin at `/admin`) + Postgres. Node 22, pnpm.

- Collections: `releases`, `videos`, `libraries` (Instruments & Plugins), `media`, `users`; globals `site` and `cv`.
- Public site: placeholder route group `src/app/(site)`; admin and API under `src/app/(payload)`.
- `GET /healthz` liveness (no DB), `GET /readyz` readiness (checks DB).
- Selling plugins: a `libraries` entry with `pricing = paid` carries `price`, `currency` and an external `buyUrl`
  (any payment provider). No cart or payment code lives here.

## Run locally

```sh
docker run -d --rm --name deig-pg -e POSTGRES_PASSWORD=pg -e POSTGRES_DB=deigineor -p 55432:5432 postgres:16
cp .env.example .env        # set PAYLOAD_SECRET
pnpm install
pnpm migrate                # schema comes from src/migrations only (push is off)
pnpm seed                   # real content from seed/data.json, idempotent
pnpm dev                    # http://localhost:3000, admin: /admin (first visit creates the first user)
```

From the repo root: `just app-dev`, `just app-seed`, `just app-check`, `just app-build`.

## CV

Global `cv` (admin: CV) holds the text in two locales (`en`, `uk`, the only localized fields in the app).
Page `/cv` and PDF `/cv.pdf` (rendered with `@react-pdf/renderer`, fonts in `public/fonts`) take `?lang=uk`.
Seed: `seed/cv.json`; it is loaded on first boot while the global is empty (`src/instrumentation.ts`) or by `pnpm seed`.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (required) |
| `PAYLOAD_SECRET` | Payload secret (required) |
| `ADMIN_EMAIL` | Initial admin email created on first boot when `users` is empty (default `admin@deigineor.com` in deploy) |
| `ADMIN_PASSWORD` | Initial admin password created on first boot when `users` is empty (generated via ESO in deploy) |
| `MEDIA_DIR` | Upload directory, default `./media`. Use an absolute path for the standalone server (it runs from `.next/standalone`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL (metadata base). Inlined at build time: a Docker build argument |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | Error reporting to GlitchTip (off without DSN) |
| `OPENPANEL_CLIENT_ID` | Enables OpenPanel analytics when set |

## Schema changes

Edit a collection, then `pnpm migrate:create <name>` and commit the new file under `src/migrations/`
(also `pnpm generate:types`). In production the pending migrations run on server start
(`prodMigrations` in `payload.config.ts`, triggered from `src/instrumentation.ts`), so there is no separate step.

## Container

```sh
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://deigineor.com -t deigineor-app v2/app
docker run --rm -p 3000:3000 -v deig-media:/data/media -e DATABASE_URL=... -e PAYLOAD_SECRET=... deigineor-app
```

Port 3000, non-root user, uploads in the `/data/media` volume.

## Seed data and first boot bootstrap

`seed/data.json` and `seed/img/` hold the real releases (from the v1/v2 sites), the two Wwise reels and the six
Pianobook packs (text and images fetched from pianobook.co.uk, "Stay tuned" lines dropped). `pnpm seed` upserts by slug.

On production boot (when `releases` has 0 docs), the app automatically runs the seed logic from images bundled
into the image. Once seeded, subsequent boots will never re-seed existing data (artist edits win).

If `users` is empty and `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, an initial admin user is created on first boot
so the public site does not expose Payload's "create first user" prompt to strangers.

To access the admin panel:
1. Print the generated admin password: `just admin-password`
2. Log in at `https://deigineor.com/admin` as `admin@deigineor.com`
3. Create the artist's own user account with administrative access
4. Optionally change the `admin@deigineor.com` email or password
