import { assetLocation, getLatest } from '../../../../lib/download/studio'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

// Public: the free Librarium Player needs no licence. Like the Studio route, never proxies the bytes.
export async function GET(request: Request) {
  const os = new URL(request.url).searchParams.get('os')
  if (os !== 'windows' && os !== 'macos' && os !== 'linux') return new Response(null, { status: 404, headers: noStore })

  const token = process.env.GITHUB_RELEASES_TOKEN
  if (!token) return new Response(null, { status: 503, headers: noStore })
  const latest = await getLatest(token).catch(() => undefined)
  if (latest === undefined) return new Response(null, { status: 502, headers: noStore })
  const id = latest?.player[os]
  if (!id) return new Response(null, { status: 404, headers: noStore })
  const location = await assetLocation(token, id).catch(() => null)
  if (!location) return new Response(null, { status: 502, headers: noStore })
  return new Response(null, { status: 302, headers: { ...noStore, Location: location } })
}
