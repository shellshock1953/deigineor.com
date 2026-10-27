/**
 * Next.js instrumentation hook, runs once per server process before any request:
 * error reporting to GlitchTip, Prometheus metrics server, database migrations, initial content seeding, and safe first admin creation.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
      release: process.env.SENTRY_RELEASE,
      // GlitchTip ignores tracing sampling but accepts the events; keep it cheap.
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
      initialScope: { tags: { service: 'deigineor-app' } },
      // The visitor closed the connection while a page was still streaming (navigated away, bot): not our bug.
      ignoreErrors: ['The destination stream closed early.'],
    })
  }

  // Before the Payload boot below, so metrics are up even if migrations/seeding are slow.
  const { startMetricsServer } = await import('./lib/metrics')
  await startMetricsServer()

  // Booting Payload applies `prodMigrations`; fail the start loudly if the DB is unreachable.
  if (process.env.NODE_ENV === 'production') {
    const { getPayload } = await import('payload')
    const payload = await getPayload({ config: (await import('@payload-config')).default })

    // 1. Ensure initial admin user exists before serving requests (prevents unauthenticated first-register).
    const users = await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if ((users.totalDocs ?? users.docs.length) === 0) {
      const email = process.env.ADMIN_EMAIL
      const password = process.env.ADMIN_PASSWORD
      if (!email || !password) {
        throw new Error('Users collection is empty, but ADMIN_EMAIL or ADMIN_PASSWORD is not set.')
      }
      await payload.create({
        collection: 'users',
        data: { email, password },
        overrideAccess: true,
      })
      console.log(`Created initial admin user: ${email}`)
    } else {
      console.log(`Users collection already populated (${users.totalDocs} users found).`)
    }

    // 2. Seed initial content if any core collection is empty (seed() is idempotent by slug).
    try {
      const [releases, libraries, videos] = await Promise.all([
        payload.find({ collection: 'releases', limit: 1, depth: 0, overrideAccess: true }),
        payload.find({ collection: 'libraries', limit: 1, depth: 0, overrideAccess: true }),
        payload.find({ collection: 'videos', limit: 1, depth: 0, overrideAccess: true }),
      ])
      const empty =
        (releases.totalDocs ?? releases.docs.length) === 0 ||
        (libraries.totalDocs ?? libraries.docs.length) === 0 ||
        (videos.totalDocs ?? videos.docs.length) === 0
      if (empty) {
        console.log('Database has empty collections. Seeding initial content...')
        const imgDir = process.env.SEED_IMG_DIR || '/app/seed/img'
        const { seed } = await import('./seed/run')
        await seed(payload, { imgDir })
      } else {
        console.log(
          `Database already seeded (${releases.totalDocs} releases found). Skipping content seed.`,
        )
      }

      // The CV global was added after the first seed: fill it once while empty (artist edits win after that).
      const cv = await payload.findGlobal({ slug: 'cv', depth: 0, overrideAccess: true })
      if (!cv.name) {
        console.log('CV global is empty. Seeding it...')
        const { seedCv } = await import('./seed/run')
        await seedCv(payload, { imgDir: process.env.SEED_IMG_DIR || '/app/seed/img' })
      }
    } catch (err) {
      console.error('Failed to seed initial content:', err)
      if (process.env.SENTRY_DSN) {
        try {
          const Sentry = await import('@sentry/nextjs')
          Sentry.captureException(err)
        } catch (sentryErr) {
          console.error('Failed to report seed error to Sentry:', sentryErr)
        }
      }
    }
  }
}

export async function onRequestError(
  ...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>
) {
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(...args)
}
