/**
 * Next.js instrumentation hook, runs once per server process before any request:
 * error reporting to GlitchTip and, in production, database migrations (via the Payload init).
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
    await getPayload({ config: (await import('@payload-config')).default })
  }
}

export async function onRequestError(
  ...args: Parameters<typeof import('@sentry/nextjs').captureRequestError>
) {
  const Sentry = await import('@sentry/nextjs')
  Sentry.captureRequestError(...args)
}
