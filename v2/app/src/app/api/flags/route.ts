import { sessionEmail } from '../../../lib/account-server'
import { enabledFlags, flagsReady } from '../../../lib/flags'
import { getPaddleConfig } from '../../../lib/paddle'

export const dynamic = 'force-dynamic'

// For client components on static pages (FeatureGate, buy buttons): which deigineor.* flags are on for this visitor.
// `paddle` is set only for testers on a production site: the buy button then checks out in the Paddle sandbox.
export async function GET() {
  await flagsReady()
  const flags = enabledFlags(await sessionEmail())
  const token = process.env.PADDLE_SANDBOX_CLIENT_TOKEN
  const paddle =
    token && getPaddleConfig()?.env === 'production' && flags.includes('deigineor.paddle-sandbox')
      ? { env: 'sandbox', token }
      : undefined
  return Response.json({ flags, paddle }, { headers: { 'Cache-Control': 'no-store' } })
}
