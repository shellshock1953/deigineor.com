import { Unleash } from 'unleash-client'

// Unleash (ara, project "default", flags prefixed `deigineor.`). Testers are the segment `deigineor-testers`
// (userId IN [their emails]); userId is the signed-in /account email. Without Unleash every flag is its fallback.
type FlagsGlobal = typeof globalThis & { __deigineorUnleash?: Unleash }
const g = globalThis as FlagsGlobal

function client(): Unleash | null {
  const url = process.env.UNLEASH_URL
  const token = process.env.UNLEASH_CLIENT_TOKEN
  if (!url || !token) return null
  if (!g.__deigineorUnleash) {
    const c = new Unleash({ appName: 'deigineor-web', url, customHeaders: { Authorization: token }, refreshInterval: 15_000 })
    c.on('error', (err) => console.error('[unleash] client error:', err))
    g.__deigineorUnleash = c
  }
  return g.__deigineorUnleash
}

/** Waits (at most `ms`) for the first sync, so a request right after a pod start sees real flag values. */
export async function flagsReady(ms = 2000): Promise<void> {
  const c = client()
  if (!c || c.isSynchronized()) return
  await new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms)
    c.once('synchronized', () => {
      clearTimeout(t)
      resolve()
    })
  })
}

export function isEnabled(name: string, email?: string | null, fallback = false): boolean {
  const c = client()
  if (!c || !c.isSynchronized()) return fallback
  try {
    return c.isEnabled(name, email ? { userId: email } : {}, fallback)
  } catch (err) {
    console.error(`[unleash] failed evaluating ${name}:`, err)
    return fallback
  }
}

/** Names of the `deigineor.*` flags that are on for this visitor (signed-in email or anonymous). */
export function enabledFlags(email?: string | null): string[] {
  const c = client()
  if (!c || !c.isSynchronized()) return []
  return c
    .getFeatureToggleDefinitions()
    .map((f) => f.name)
    .filter((n) => n.startsWith('deigineor.') && isEnabled(n, email))
}
