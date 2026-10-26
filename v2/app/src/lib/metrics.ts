/**
 * Prometheus metrics, served on a dedicated port (METRICS_PORT, default 9464) that the ingress
 * does not route, so /metrics is scrapable in-cluster (VMServiceScrape in v2/deploy) but never public.
 * Page views are deliberately not counted here: pages are ISR-cached, analytics live in OpenPanel.
 */
import { collectDefaultMetrics, Gauge, Registry } from 'prom-client'

/**
 * Next.js bundles instrumentation.ts separately from page code, so this module can be instantiated
 * more than once per process. Pin the registry on globalThis so every bundle shares one instance.
 */
type MetricsGlobal = typeof globalThis & { __deigineorRegistry?: Registry }
const g = globalThis as MetricsGlobal

function createRegistry(): Registry {
  const r = new Registry()
  r.setDefaultLabels({ app: 'deigineor' })
  collectDefaultMetrics({ register: r })
  new Gauge({
    name: 'deigineor_build_info',
    help: 'Build/release of the running app (value is always 1)',
    labelNames: ['release'] as const,
    registers: [r],
  }).set({ release: process.env.SENTRY_RELEASE ?? 'unknown' }, 1)
  return r
}

export const registry: Registry = (g.__deigineorRegistry ??= createRegistry())

let started = false

/** Starts the metrics HTTP server once per process; no-op if already started or METRICS_DISABLED=true. */
export async function startMetricsServer(): Promise<void> {
  if (started || process.env.METRICS_DISABLED === 'true') return
  started = true

  const { createServer } = await import('node:http')
  const port = Number(process.env.METRICS_PORT ?? 9464)

  createServer(async (req, res) => {
    if (req.url !== '/metrics') {
      res.writeHead(404).end()
      return
    }
    try {
      const body = await registry.metrics()
      res.writeHead(200, { 'content-type': registry.contentType }).end(body)
    } catch {
      res.writeHead(500).end()
    }
  })
    .listen(port, '0.0.0.0')
    .on('error', (err) => {
      // Never take the app down because metrics could not bind.
      console.error('metrics server failed to start:', err.message)
    })
}
