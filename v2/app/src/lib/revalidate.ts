import { revalidatePath } from 'next/cache'

/**
 * On-demand revalidation for the public site, called from Payload afterChange
 * hooks so admin edits show up immediately on the ISR-cached pages
 * (`/music/[slug]`, `/instruments/[slug]`, `/sitemap.xml`).
 *
 * Wrapped in try/catch because the hooks also fire outside of a Next request
 * (the `payload` CLI: `pnpm seed`, `pnpm migrate`) where there is nothing
 * cached to invalidate and `revalidatePath` has no request store.
 */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
    revalidatePath('/sitemap.xml')
  } catch {
    // Not inside a Next.js request — nothing to do.
  }
}
