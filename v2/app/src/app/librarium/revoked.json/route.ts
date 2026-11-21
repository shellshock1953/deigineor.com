import { getPayload } from 'payload'
import config from '@payload-config'

import { getRevokedJson } from '../../../lib/license/revocations'

export const dynamic = 'force-dynamic'

// Fetched once per Studio start (docs/licensing.md in VST-DEV): the signed list, or an empty signed one the first time.
export async function GET() {
  const payload = await getPayload({ config })
  const json = await getRevokedJson(payload, process.env.LICENSE_SIGNING_KEY)
  if (!json) return new Response(null, { status: 503 })
  return new Response(json, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  })
}
