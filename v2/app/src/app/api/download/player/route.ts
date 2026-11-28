import { assetLocation, getRelease, versionParam } from '../../../../lib/download/studio'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

// Public: the free Librarium Player needs no licence. Like the Studio route, never proxies the bytes.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const os = url.searchParams.get('os')
  const version = versionParam(url)
  if ((os !== 'windows' && os !== 'macos' && os !== 'linux') || version === null) return new Response(null, { status: 404, headers: noStore })

  const token = process.env.GITHUB_RELEASES_TOKEN
  if (!token) return new Response(null, { status: 503, headers: noStore })
  const latest = await getRelease(token, version).catch(() => undefined)
  if (latest === undefined) return new Response(null, { status: 502, headers: noStore })
  const id = latest?.player[os]
  if (!id) return new Response(null, { status: 404, headers: noStore })
  const location = await assetLocation(token, id).catch(() => null)
  if (!location) return new Response(null, { status: 502, headers: noStore })
  return new Response(null, { status: 302, headers: { ...noStore, Location: location } })
}
