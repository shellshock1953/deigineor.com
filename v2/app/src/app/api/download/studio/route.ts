import { getPayload } from 'payload'
import config from '@payload-config'

import { assetLocation, getRelease, versionParam } from '../../../../lib/download/studio'
import { flagsReady } from '../../../../lib/flags'
import { effectiveStatus } from '../../../../lib/testers'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

// Same bearer-txn model as /api/licence: only an active licence gets the (private) release asset.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const txn = url.searchParams.get('txn') ?? ''
  const os = url.searchParams.get('os')
  const version = versionParam(url)
  if (!/^txn_[0-9a-z]{1,64}$/.test(txn) || (os !== 'windows' && os !== 'macos' && os !== 'linux') || version === null) {
    return new Response(null, { status: 404, headers: noStore })
  }
  await flagsReady()
  const payload = await getPayload({ config })
  const found = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
  const doc = found.docs[0]
  if (!doc || effectiveStatus(doc) !== 'active') return new Response(null, { status: 404, headers: noStore })

  const token = process.env.GITHUB_RELEASES_TOKEN
  if (!token) return new Response(null, { status: 503, headers: noStore })
  const id = (await getRelease(token, version))?.assets[os]
  if (!id) return new Response(null, { status: 404, headers: noStore })
  const location = await assetLocation(token, id)
  if (!location) return new Response(null, { status: 502, headers: noStore })
  return new Response(null, { status: 302, headers: { ...noStore, Location: location } })
}
