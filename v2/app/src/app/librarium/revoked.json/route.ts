import { getPayload } from 'payload'
import config from '@payload-config'

import { flagsReady } from '../../../lib/flags'
import { getRevokedJson, syncTesterRevocations } from '../../../lib/license/revocations'
import { desiredTesterRevocations } from '../../../lib/testers'

export const dynamic = 'force-dynamic'

// Fetched once per Studio start (docs/licensing.md in VST-DEV): the signed list, or an empty signed one the first time.
export async function GET() {
  const payload = await getPayload({ config })
  const key = process.env.LICENSE_SIGNING_KEY
  await flagsReady()
  let json = await getRevokedJson(payload, key)
  // Tester rows revoked through `revoked.*` flags go into the signed list, so the plugin's revoked path can be tested.
  if (json && key) json = (await syncTesterRevocations(payload, key, await desiredTesterRevocations(payload))) ?? json
  if (!json) return new Response(null, { status: 503 })
  return new Response(json, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  })
}
