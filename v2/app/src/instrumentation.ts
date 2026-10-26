/**
 * Next.js instrumentation hook, runs once per server process before any request:
 * error reporting to GlitchTip, database migrations, initial content seeding, and safe first admin creation.
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
    })
  }

  // Booting Payload applies `prodMigrations`; fail the start loudly if the DB is unreachable.
  if (process.env.NODE_ENV === 'production') {
    const { getPayload } = await import('payload')
    const payload = await getPayload({ config: (await import('@payload-config')).default })

    // 1. Seed initial content if releases collection is empty
    try {
      const releases = await payload.find({
        collection: 'releases',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if ((releases.totalDocs ?? releases.docs.length) === 0) {
        console.log('Database has 0 releases. Seeding initial content...')
        const imgDir = process.env.SEED_IMG_DIR || '/app/seed/img'
        const { seed } = await import('./seed/run')
        await seed(payload, { imgDir })
      } else {
        console.log(
          `Database already seeded (${releases.totalDocs} releases found). Skipping content seed.`,
        )
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

    // 2. Create initial admin user if users collection is empty and credentials are provided
    try {
      const users = await payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if ((users.totalDocs ?? users.docs.length) === 0) {
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD
        if (email && password) {
          await payload.create({
            collection: 'users',
            data: { email, password },
            overrideAccess: true,
          })
          console.log(`Created initial admin user: ${email}`)
        } else {
          console.warn('Users collection is empty, but ADMIN_EMAIL or ADMIN_PASSWORD is not set.')
        }
      } else {
        console.log(`Users collection already populated (${users.totalDocs} users found).`)
      }
    } catch (err) {
      console.error('Failed to create initial admin user:', err)
      if (process.env.SENTRY_DSN) {
        try {
          const Sentry = await import('@sentry/nextjs')
          Sentry.captureException(err)
        } catch (sentryErr) {
          console.error('Failed to report admin user creation error to Sentry:', sentryErr)
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
