import { sessionEmail } from '../../../lib/account-server'
import { enabledFlags, flagsReady } from '../../../lib/flags'

export const dynamic = 'force-dynamic'

// For client components on static pages (FeatureGate, buy buttons): which deigineor.* flags are on for this visitor.
export async function GET() {
  await flagsReady()
  const flags = enabledFlags(await sessionEmail())
  return Response.json({ flags }, { headers: { 'Cache-Control': 'no-store' } })
}
